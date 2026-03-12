/**
 * 場景 1：正常渲染
 * 後端回傳有效資料，各指標正確顯示
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createAppTheme } from '../../theme'
import Dashboard from '../../components/Dashboard'
import { getLastEventSource, instances } from '../setup'
import type { SystemMetrics } from '../../types/metrics'

const MOCK_METRIC: SystemMetrics = {
  timestamp: Date.now(),
  cpu: { usage: 45.2, cores: [30, 50, 40, 60] },
  memory: { total: 16e9, available: 8e9, usage: 50.0, swapUsage: 5.0 },
  disk: [
    { device: '/dev/sda1', mountpoint: '/', totalGb: 500, usedGb: 200, freeGb: 300, usage: 40.0 },
  ],
  network: { rxBps: 1024 * 512, txBps: 1024 * 256 },
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

describe('場景 1：正常渲染', () => {
  it('顯示 AppBar 標題', () => {
    renderDashboard()
    expect(screen.getByText('AIDMS System Monitor')).toBeInTheDocument()
  })

  it('初始狀態顯示連線中文字', () => {
    renderDashboard()
    expect(screen.getByText(/正在連線/)).toBeInTheDocument()
  })

  it('收到 history event 後顯示 CPU 指標', async () => {
    renderDashboard()

    await act(async () => {
      const es = getLastEventSource()
      es.emit('history', { metrics: [MOCK_METRIC] })
    })

    expect(screen.getByText('CPU')).toBeInTheDocument()
    expect(screen.getByText('45.2%')).toBeInTheDocument()
  })

  it('收到 metrics event 後更新數值', async () => {
    renderDashboard()

    await act(async () => {
      const es = getLastEventSource()
      es.emit('history', { metrics: [MOCK_METRIC] })
    })

    const updatedMetric: SystemMetrics = { ...MOCK_METRIC, cpu: { ...MOCK_METRIC.cpu, usage: 62.5 } }

    await act(async () => {
      const es = getLastEventSource()
      es.emit('metrics', updatedMetric)
    })

    expect(screen.getByText('62.5%')).toBeInTheDocument()
  })
})
