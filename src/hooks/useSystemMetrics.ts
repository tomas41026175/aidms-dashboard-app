import { useState, useEffect } from 'react'
import type { SystemMetrics, HistoryPayload, ConnectionStatus } from '../types/metrics'

const MAX_POINTS = 150 // 2s × 150 = 5 分鐘

interface UseSystemMetricsResult {
  latest: SystemMetrics | null
  history: SystemMetrics[]
  status: ConnectionStatus
}

export function useSystemMetrics(): UseSystemMetricsResult {
  const [latest, setLatest] = useState<SystemMetrics | null>(null)
  const [history, setHistory] = useState<SystemMetrics[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  useEffect(() => {
    const es = new EventSource('/api/metrics/stream')

    // 連線時先送歷史，頁面立即有資料（解決 < 2s 需求）
    es.addEventListener('history', (e: MessageEvent) => {
      const payload = JSON.parse(e.data as string) as HistoryPayload
      setHistory(payload.metrics)
      const last = payload.metrics[payload.metrics.length - 1]
      if (last) setLatest(last)
      setStatus('connected')
    })

    // 每 2 秒推送一筆
    es.addEventListener('metrics', (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as SystemMetrics
      setLatest(data)
      setHistory(prev => {
        // spread + slice：React 需要新 reference 才觸發 re-render
        const next = [...prev, data]
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next
      })
      setStatus('connected')
    })

    // EventSource 瀏覽器原生自動重連，不需手動實作
    es.onerror = () => setStatus('error')

    return () => {
      es.close()
    }
  }, [])

  return { latest, history, status }
}
