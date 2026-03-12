import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { BarChart } from '@aidms/chart-components'
import type { DiskPartition } from '../types/metrics'

interface Props {
  disks: DiskPartition[]
}

export default function DiskPanel({ disks }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', letterSpacing: '0.1em', display: 'block', mb: 1 }}
        >
          磁碟分區
        </Typography>
        <BarChart
          labels={disks.map(d => d.mountpoint)}
          datasets={[
            { label: '已用 GB', data: disks.map(d => d.usedGb), color: '#f87171' },
            { label: '可用 GB', data: disks.map(d => d.freeGb), color: '#34d399' },
          ]}
          stacked
          height={200}
          animate={false}
        />
      </CardContent>
    </Card>
  )
}
