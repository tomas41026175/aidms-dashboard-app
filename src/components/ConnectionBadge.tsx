import Chip from '@mui/material/Chip'
import type { ConnectionStatus } from '../types/metrics'

interface Props {
  status: ConnectionStatus
}

const CONFIG: Record<ConnectionStatus, { label: string; color: string }> = {
  connecting: { label: '連線中...', color: '#fbbf24' },
  connected: { label: '● Live', color: '#34d399' },
  error: { label: '連線錯誤', color: '#f87171' },
}

export default function ConnectionBadge({ status }: Props) {
  const { label, color } = CONFIG[status]
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        color,
        borderColor: color,
        fontVariantNumeric: 'tabular-nums',
        fontSize: '0.75rem',
      }}
      variant="outlined"
    />
  )
}
