/**
 * 場景 3：SSE 資料更新驗證
 * 滑動視窗、資料累積、連線狀態轉換
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createAppTheme } from '../../theme'
import Dashboard from '../../components/Dashboard'
import { getLastEventSource, instances } from '../setup'
import type { SystemMetrics } from '../../types/metrics'

function makeMetric(cpu: number, ts = Date.now()): SystemMetrics {
  return {
    timestamp: ts,
    cpu: { usage: cpu, cores: [cpu] },
    memory: { total: 16e9, available: 12e9, usage: 25.0, swapUsage: 0 },
    disk: [{ device: '/dev/sda1', mountpoint: '/', totalGb: 500, usedGb: 100, freeGb: 400, usage: 20.0 }],
    network: { rxBps: 0, txBps: 0 },
  }
}

beforeEach(() => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList)
  instances.length = 0
})

afterEach(() => {
  vi.restoreAllMocks()
})

function renderDashboard() {
  return render(
    <ThemeProvider theme={createAppTheme('dark')}>
      <Dashboard mode="dark" onToggleMode={vi.fn()} />
    </ThemeProvider>,
  )
}

describe('場景 3：SSE 資料更新', () => {
  it('初始連線狀態為連線中', () => {
    renderDashboard()
    expect(screen.getByText('連線中...')).toBeInTheDocument()
  })

  it('收到 history event 後狀態改為 Live', async () => {
    renderDashboard()

    await act(async () => {
      const es = getLastEventSource()
      es.emit('history', { metrics: [makeMetric(30)] })
    })

    expect(screen.getByText('● Live')).toBeInTheDocument()
  })

  it('連續收到 metrics event 後顯示最新值', async () => {
    renderDashboard()

    await act(async () => {
      const es = getLastEventSource()
      es.emit('history', { metrics: [makeMetric(30)] })
    })

    await act(async () => {
      const es = getLastEventSource()
      es.emit('metrics', makeMetric(55.5))
    })

    await act(async () => {
      const es = getLastEventSource()
      es.emit('metrics', makeMetric(78.3))
    })

    expect(screen.getByText('78.3%')).toBeInTheDocument()
  })

  it('歷史資料中有 3 筆 critical 才觸發 critical 告警', async () => {
    renderDashboard()

    // 先給 3 筆 critical 歷史（CPU > 85）
    const criticalHistory = [
      makeMetric(90, Date.now() - 4000),
      makeMetric(91, Date.now() - 2000),
      makeMetric(92, Date.now()),
    ]

    await act(async () => {
      const es = getLastEventSource()
      es.emit('history', { metrics: criticalHistory })
    })

    // critical 告警文字應顯示
    expect(screen.getAllByText('critical').length).toBeGreaterThan(0)
  })
})
