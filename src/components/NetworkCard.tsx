import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { formatBps } from '../utils/format'

interface Props {
  rxBps: number
  txBps: number
}

export default function NetworkCard({ rxBps, txBps }: Props) {
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
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ↓ 下載（RX）
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#34d399' }}
            >
              {formatBps(rxBps)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ↑ 上傳（TX）
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#a78bfa' }}
            >
              {formatBps(txBps)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
