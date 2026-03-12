import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { LineChart } from '@aidms/chart-components'
import type { Dataset } from '@aidms/chart-components'

interface Props {
  title: string
  labels: string[]
  datasets: Dataset[]
  yRange?: [number, number]
}

export default function TrendPanel({ title, labels, datasets, yRange }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: '0.1em', display: 'block', mb: 1 }}
        >
          {title}
        </Typography>
        <LineChart
          labels={labels}
          datasets={datasets}
          height={180}
          animate={false}
          {...(yRange ? { yRange } : {})}
        />
      </CardContent>
    </Card>
  )
}
