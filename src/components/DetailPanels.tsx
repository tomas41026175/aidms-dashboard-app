import { memo } from 'react'
import Grid from '@mui/material/Grid'
import CpuCorePanel from './CpuCorePanel'
import DiskPanel from './DiskPanel'
import type { SystemMetrics } from '../types/metrics'

interface Props {
  latest: SystemMetrics
}

function DetailPanels({ latest }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <CpuCorePanel cores={latest.cpu.cores} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <DiskPanel disks={latest.disk} />
      </Grid>
    </Grid>
  )
}

export default memo(DetailPanels)
