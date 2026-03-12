import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as si from 'systeminformation'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
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

function sendEvent(res, eventName, data) {
  res.write(`event: ${eventName}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

function broadcast(eventName, data) {
  for (const res of clients) {
    sendEvent(res, eventName, data)
  }
}

// ── Metrics Collection ─────────────────────────────────────────
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

  // Disk（過濾虛擬 / 系統 filesystem）
  const EXCLUDE_TYPES = ['tmpfs', 'devtmpfs', 'squashfs', 'overlay', 'proc', 'sysfs', 'devfs']
  const diskPartitions = disks
    .filter(d => d.size > 0 && !EXCLUDE_TYPES.includes(d.type))
    .map(d => ({
      device: d.fs,
      mountpoint: d.mount,
      totalGb: parseFloat((d.size / 1e9).toFixed(2)),
      usedGb: parseFloat((d.used / 1e9).toFixed(2)),
      freeGb: parseFloat(((d.size - d.used) / 1e9).toFixed(2)),
      usage: parseFloat(d.use.toFixed(1)),
    }))

  // Network（計算 delta bytes/sec）
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

  // Load Average（Linux/Mac only）
  let loadAvg
  try {
    const loadData = await si.currentLoad()
    if (process.platform !== 'win32') {
      const { loadavg } = await import('os')
      loadAvg = loadavg()
    }
    void loadData
  } catch {
    // ignore
  }

  /** @type {import('./src/types/metrics.js').SystemMetrics} */
  const metric = {
    timestamp: Date.now(),
    cpu: { usage: cpuUsage, cores },
    memory: {
      total: mem.total,
      available: mem.available,
      usage: memUsage,
      swapUsage,
    },
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
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // 關閉 Nginx buffer
  res.flushHeaders()

  clients.add(res)

  // 連線時立即送歷史資料（頁面馬上有圖）
  sendEvent(res, 'history', { metrics: history })

  req.on('close', () => {
    clients.delete(res)
  })
})

// ── REST fallback ──────────────────────────────────────────────
app.get('/api/metrics/latest', (_req, res) => {
  const latest = history[history.length - 1] ?? null
  res.json({ data: latest })
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

// 立刻收集一次（讓 history 有初始資料）
await tick()

// 每 2 秒推送
setInterval(tick, 2000)

// 每 15 秒心跳（防 Nginx 60s timeout 斷線）
setInterval(() => {
  for (const res of clients) {
    res.write(': keepalive\n\n')
  }
}, 15000)

app.listen(PORT, () => {
  console.log(`[AIDMS] Server running on http://localhost:${PORT}`)
  console.log(`[AIDMS] SSE stream: http://localhost:${PORT}/api/metrics/stream`)
})
