import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { formatBps } from '../utils/format'

// #16: 網路色系常數，集中管理
const NETWORK_COLORS = {
  rx: '#34d399', // emerald-400 — 下載
  tx: '#a78bfa', // violet-400  — 上傳（與 primary.main 同色系）
} as const

interface Props {
  rxBps: number
  txBps: number
}

export default function NetworkCard({ rxBps, txBps }: Props) {
  const theme = useTheme()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: '0.1em', display: 'block', mb: 1 }}
        >
          網路流量
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              ↓ 下載（RX）
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: NETWORK_COLORS.rx }}
            >
              {formatBps(rxBps)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              ↑ 上傳（TX）
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: NETWORK_COLORS.tx }}
            >
              {formatBps(txBps)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
