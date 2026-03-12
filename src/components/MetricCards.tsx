import Grid from '@mui/material/Grid'
import MetricGauge from './MetricGauge'
import NetworkCard from './NetworkCard'
import {
  CPU_THRESHOLDS,
  MEM_THRESHOLDS,
  DISK_THRESHOLDS,
} from '../utils/alert-thresholds'
import type { AlertLevel } from '../utils/alert-thresholds'
import type { SystemMetrics } from '../types/metrics'

interface Props {
  latest: SystemMetrics
  cpuAlert: AlertLevel
  memAlert: AlertLevel
  diskAlert: AlertLevel
}

export default function MetricCards({ latest, cpuAlert, memAlert, diskAlert }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <MetricGauge
          title="CPU"
          value={latest.cpu.usage}
          alertLevel={cpuAlert}
          thresholds={CPU_THRESHOLDS}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <MetricGauge
          title="記憶體"
          value={latest.memory.usage}
          alertLevel={memAlert}
          thresholds={MEM_THRESHOLDS}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <MetricGauge
          title="磁碟"
          value={latest.disk[0]?.usage ?? 0}
          alertLevel={diskAlert}
          thresholds={DISK_THRESHOLDS}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <NetworkCard
          rxBps={latest.network.rxBps}
          txBps={latest.network.txBps}
        />
      </Grid>
    </Grid>
  )
}
