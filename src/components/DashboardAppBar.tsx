import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import ConnectionBadge from './ConnectionBadge'
import ThemeToggle from './ThemeToggle'
import type { ConnectionStatus } from '../types/metrics'

interface Props {
  status: ConnectionStatus
  mode: 'light' | 'dark'
  onToggleMode: () => void
}

export default function DashboardAppBar({ status, mode, onToggleMode }: Props) {
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          AIDMS System Monitor
        </Typography>
        <ConnectionBadge status={status} />
        <ThemeToggle mode={mode} onToggle={onToggleMode} />
      </Toolbar>
    </AppBar>
  )
}
