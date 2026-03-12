import { useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme } from './theme'
import Dashboard from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  function toggleMode() {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Dashboard mode={mode} onToggleMode={toggleMode} />
      </ErrorBoundary>
    </ThemeProvider>
  )
}
