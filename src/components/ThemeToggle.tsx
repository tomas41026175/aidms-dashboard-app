import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

interface Props {
  mode: 'light' | 'dark'
  onToggle: () => void
}

export default function ThemeToggle({ mode, onToggle }: Props) {
  return (
    <Tooltip title={mode === 'dark' ? '切換亮色模式' : '切換暗色模式'}>
      <IconButton
        onClick={onToggle}
        size="small"
        sx={{ color: 'text.secondary' }}
        aria-label={mode === 'dark' ? '切換亮色模式' : '切換暗色模式'}
      >
        {mode === 'dark' ? '☀️' : '🌙'}
      </IconButton>
    </Tooltip>
  )
}
