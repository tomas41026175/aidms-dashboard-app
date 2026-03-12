import { memo } from 'react'
import Grid from '@mui/material/Grid'
import TrendPanel from './TrendPanel'
import type { SystemMetrics } from '../types/metrics'

interface Props {
  history: SystemMetrics[]
}

function TrendCharts({ history }: Props) {
  const labels = history.map((_, i) => `${i * 2}s`)

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <TrendPanel
          title="CPU + 記憶體趨勢（5 分鐘）"
          labels={labels}
          datasets={[
            { label: 'CPU %', data: history.map(h => h.cpu.usage), color: '#a78bfa' },
            { label: '記憶體 %', data: history.map(h => h.memory.usage), color: '#34d399' },
          ]}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <TrendPanel
          title="網路流量趨勢"
          labels={labels}
          datasets={[
            { label: 'RX KB/s', data: history.map(h => h.network.rxBps / 1024), color: '#34d399' },
            { label: 'TX KB/s', data: history.map(h => h.network.txBps / 1024), color: '#a78bfa' },
          ]}
        />
      </Grid>
    </Grid>
  )
}

export default memo(TrendCharts)
