import { useState, useEffect } from 'react'
import type { SystemMetrics, HistoryPayload, ConnectionStatus } from '../types/metrics'

const MAX_POINTS = 150 // 2s × 150 = 5 分鐘

interface UseSystemMetricsResult {
  latest: SystemMetrics | null
  history: SystemMetrics[]
  status: ConnectionStatus
}

function parseHistoryPayload(raw: unknown): HistoryPayload | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.metrics)) return null
  return obj as unknown as HistoryPayload
}

function isValidMetrics(data: unknown): data is SystemMetrics {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  if (typeof (d.cpu as Record<string, unknown>)?.usage !== 'number') return false
  if (typeof (d.memory as Record<string, unknown>)?.usage !== 'number') return false
  if (!Array.isArray(d.disk)) return false
  if (typeof (d.network as Record<string, unknown>)?.rxBps !== 'number') return false
  return true
}

export function useSystemMetrics(): UseSystemMetricsResult {
  const [latest, setLatest] = useState<SystemMetrics | null>(null)
  const [history, setHistory] = useState<SystemMetrics[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    const es = new EventSource('/api/metrics/stream')

    es.addEventListener('history', (e: MessageEvent) => {
      const payload = parseHistoryPayload(JSON.parse(e.data))
      if (!payload) return
      setHistory(payload.metrics)
      const last = payload.metrics[payload.metrics.length - 1]
      if (last) setLatest(last)
      setStatus('connected')
    })

    es.addEventListener('metrics', (e: MessageEvent) => {
      const data: unknown = JSON.parse(e.data)
      if (!isValidMetrics(data)) return
      setLatest(data)
      setHistory(prev => {
        const next = [...prev, data]
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next
      })
      setStatus('connected')
    })

    es.onerror = () => setStatus('error')

    return () => {
      es.close()
    }
  }, [])

  return { latest, history, status }
}
