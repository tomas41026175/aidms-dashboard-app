import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { BarChart } from '@aidms/chart-components'

interface Props {
  cores: number[]
}

export default function CpuCorePanel({ cores }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: '0.1em', display: 'block', mb: 1 }}
        >
          Per-Core CPU
        </Typography>
        <BarChart
          labels={cores.map((_, i) => `C${i}`)}
          datasets={[{ label: '使用率 %', data: cores, color: '#a78bfa' }]}
          height={200}
          yRange={[0, 100]}
          animate={false}
        />
      </CardContent>
    </Card>
  )
}
