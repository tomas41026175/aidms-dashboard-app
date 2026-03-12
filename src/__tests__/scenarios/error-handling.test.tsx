/**
 * 場景 2：錯誤處理
 * SSE 連線失敗、ErrorBoundary 捕捉 render 錯誤
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createAppTheme } from '../../theme'
import Dashboard from '../../components/Dashboard'
import ErrorBoundary from '../../components/ErrorBoundary'
import { getLastEventSource, instances } from '../setup'

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
  // suppress console.error for ErrorBoundary tests
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('場景 2：錯誤處理', () => {
  it('SSE 連線錯誤時顯示錯誤狀態 badge', async () => {
    render(
      <ThemeProvider theme={createAppTheme('dark')}>
        <Dashboard mode="dark" onToggleMode={vi.fn()} />
      </ThemeProvider>,
    )

    await act(async () => {
      const es = getLastEventSource()
      es.triggerError()
    })

    expect(screen.getByText('連線錯誤')).toBeInTheDocument()
  })

  it('SSE 錯誤後顯示後端未啟動提示', async () => {
    render(
      <ThemeProvider theme={createAppTheme('dark')}>
        <Dashboard mode="dark" onToggleMode={vi.fn()} />
      </ThemeProvider>,
    )

    await act(async () => {
      const es = getLastEventSource()
      es.triggerError()
    })

    expect(screen.getByText(/node server\.js/)).toBeInTheDocument()
  })

  it('ErrorBoundary 捕捉 render 錯誤並顯示 fallback UI', () => {
    function ThrowingComponent(): never {
      throw new Error('測試錯誤訊息')
    }

    render(
      <ThemeProvider theme={createAppTheme('dark')}>
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      </ThemeProvider>,
    )

    expect(screen.getByText('系統發生錯誤')).toBeInTheDocument()
    expect(screen.getByText('測試錯誤訊息')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新載入' })).toBeInTheDocument()
  })
})
