import { keyframes } from '@mui/system'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { GaugeChart } from '@aidms/chart-components'
import { getAlertColor } from '../utils/alert-colors'
import type { AlertLevel, Thresholds } from '../utils/alert-thresholds'
import { formatPercent } from '../utils/format'

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(248, 113, 113, 0); }
`

interface Props {
  title: string
  value: number
  alertLevel: AlertLevel
  thresholds: Thresholds
}

export default function MetricGauge({ title, value, alertLevel, thresholds }: Props) {
  const color = getAlertColor(alertLevel)

  return (
    <Card
      aria-live={alertLevel === 'critical' ? 'assertive' : 'off'}
      aria-atomic="true"
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: alertLevel === 'normal' ? 'divider' : color.main,
        transition: 'border-color 0.3s ease',
        animation: alertLevel === 'critical' ? `${pulse} 2s ease-out infinite` : 'none',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
          <GaugeChart
            value={value}
            min={0}
            max={100}
            label={title}
            height={90}
            color={color.main}
            animate={false}
            formatValue={() => ''}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: color.main }}
          >
            {formatPercent(value)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: color.main, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {alertLevel}
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          W: {formatPercent(thresholds.warning, 0)} · C: {formatPercent(thresholds.critical, 0)}
        </Typography>
      </CardContent>
    </Card>
  )
}
