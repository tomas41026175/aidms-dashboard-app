import express from 'express'
import cors from 'cors'
import { loadavg, platform } from 'os'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as si from 'systeminformation'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// #20: PORT from env
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001

// #1: CORS 白名單，不開放 *
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:3001')
  .split(',')
  .map(o => o.trim())

app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json())

// ── Ring Buffer ────────────────────────────────────────────────
const MAX_HISTORY = 150 // 2s × 150 = 5 分鐘

/** @type {import('./src/types/metrics.js').SystemMetrics[]} */
const history = []

function pushHistory(metric) {
  history.push(metric)
  if (history.length > MAX_HISTORY) {
    history.shift()
  }
}

// ── SSE Client Manager ─────────────────────────────────────────
/** @type {Set<import('express').Response>} */
const clients = new Set()

// #3: 每個 IP 最多 MAX_CONNECTIONS 個 SSE 連線
const MAX_CONNECTIONS_PER_IP = 5
/** @type {Map<string, number>} */
const connectionCount = new Map()

function sendEvent(res, eventName, data) {
  res.write(`event: ${eventName}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

function broadcast(eventName, data) {
  for (const res of clients) {
    try {
      sendEvent(res, eventName, data)
    } catch {
      clients.delete(res)
    }
  }
}

// ── Metrics Collection ─────────────────────────────────────────
// #22: 模組層級常數，不在函式內每次重建
const EXCLUDE_FSTYPES = new Set(['tmpfs', 'devtmpfs', 'squashfs', 'overlay', 'proc', 'sysfs', 'devfs'])

let prevNetworkStats = null

async function collectMetrics() {
  const [load, mem, disks, networks] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
  ])

  // CPU
  const cpuUsage = parseFloat(load.currentLoad.toFixed(1))
  const cores = (load.cpus ?? []).map(c => parseFloat(c.load.toFixed(1)))

  // Memory
  const memUsage = parseFloat(((1 - mem.available / mem.total) * 100).toFixed(1))
  const swapUsage =
    mem.swaptotal > 0
      ? parseFloat(((mem.swapused / mem.swaptotal) * 100).toFixed(1))
      : 0

  // Disk
  const diskPartitions = disks
    .filter(d => d.size > 0 && !EXCLUDE_FSTYPES.has(d.type))
    .map(d => ({
      device: d.fs,
      mountpoint: d.mount,
      totalGb: parseFloat((d.size / 1e9).toFixed(2)),
      usedGb: parseFloat((d.used / 1e9).toFixed(2)),
      freeGb: parseFloat(((d.size - d.used) / 1e9).toFixed(2)),
      // #5: d.use 可能為 null（虛擬掛載點）
      usage: parseFloat((d.use ?? 0).toFixed(1)),
    }))

  // Network（delta bytes/sec）
  let rxBps = 0
  let txBps = 0
  const totalRx = networks.reduce((s, n) => s + (n.rx_bytes ?? 0), 0)
  const totalTx = networks.reduce((s, n) => s + (n.tx_bytes ?? 0), 0)

  if (prevNetworkStats) {
    const elapsed = (Date.now() - prevNetworkStats.ts) / 1000
    if (elapsed > 0) {
      rxBps = Math.max(0, (totalRx - prevNetworkStats.rx) / elapsed)
      txBps = Math.max(0, (totalTx - prevNetworkStats.tx) / elapsed)
    }
  }
  prevNetworkStats = { ts: Date.now(), rx: totalRx, tx: totalTx }

  // #4: 靜態 import loadavg，不重複呼叫 si.currentLoad()
  const loadAvg = platform() !== 'win32' ? loadavg() : undefined

  /** @type {import('./src/types/metrics.js').SystemMetrics} */
  const metric = {
    timestamp: Date.now(),
    cpu: { usage: cpuUsage, cores },
    memory: { total: mem.total, available: mem.available, usage: memUsage, swapUsage },
    disk: diskPartitions,
    network: {
      rxBps: parseFloat(rxBps.toFixed(0)),
      txBps: parseFloat(txBps.toFixed(0)),
    },
    ...(loadAvg ? { loadAvg } : {}),
  }

  return metric
}

// ── SSE Endpoint ───────────────────────────────────────────────
app.get('/api/metrics/stream', async (req, res) => {
  // #3: 連線數上限
  const ip = req.ip ?? 'unknown'
  const count = connectionCount.get(ip) ?? 0
  if (count >= MAX_CONNECTIONS_PER_IP) {
    res.status(429).json({ error: 'Too many SSE connections from this IP' })
    return
  }
  connectionCount.set(ip, count + 1)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  clients.add(res)
  sendEvent(res, 'history', { metrics: history })

  req.on('close', () => {
    clients.delete(res)
    const current = connectionCount.get(ip) ?? 1
    if (current <= 1) connectionCount.delete(ip)
    else connectionCount.set(ip, current - 1)
  })
})

// ── REST fallback ──────────────────────────────────────────────
app.get('/api/metrics/latest', (_req, res) => {
  const latest = history[history.length - 1] ?? null
  res.json({ data: latest })
})

// #2: /api 未命中路由時回 404（不讓 static catch-all 掩蓋）
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// ── Static files（production build）───────────────────────────
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

// ── Polling ────────────────────────────────────────────────────
async function tick() {
  try {
    const metric = await collectMetrics()
    pushHistory(metric)
    broadcast('metrics', metric)
  } catch (err) {
    console.error('[server] collectMetrics error:', err)
  }
}

await tick()
setInterval(tick, 2000)

// #9: 心跳加 try/catch，斷線的 res 自動從 clients 移除
setInterval(() => {
  for (const res of clients) {
    try {
      res.write(': keepalive\n\n')
    } catch {
      clients.delete(res)
    }
  }
}, 15000)

app.listen(PORT, () => {
  console.log(`[AIDMS] Server running on http://localhost:${PORT}`)
  console.log(`[AIDMS] SSE stream: http://localhost:${PORT}/api/metrics/stream`)
})
