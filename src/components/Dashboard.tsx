import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useSystemMetrics } from '../hooks/useSystemMetrics'
import {
  deriveAlertLevel,
  worstDiskUsage,
  CPU_THRESHOLDS,
  MEM_THRESHOLDS,
  DISK_THRESHOLDS,
} from '../utils/alert-thresholds'
import DashboardAppBar from './DashboardAppBar'
import MetricCards from './MetricCards'
import TrendCharts from './TrendCharts'
import DetailPanels from './DetailPanels'

const BACKEND_START_CMD = 'node server.js'

interface Props {
  mode: 'light' | 'dark'
  onToggleMode: () => void
}

export default function Dashboard({ mode, onToggleMode }: Props) {
  const { latest, history, status } = useSystemMetrics()
  const theme = useTheme()
  const isTabletUp = useMediaQuery(theme.breakpoints.up('sm'))
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('md'))

  const cpuAlert = useMemo(
    () => deriveAlertLevel(history, m => m.cpu.usage, CPU_THRESHOLDS),
    [history],
  )
  const memAlert = useMemo(
    () => deriveAlertLevel(history, m => m.memory.usage, MEM_THRESHOLDS),
    [history],
  )
  const diskAlert = useMemo(
    () => deriveAlertLevel(history, worstDiskUsage, DISK_THRESHOLDS),
    [history],
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardAppBar status={status} mode={mode} onToggleMode={onToggleMode} />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {latest == null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <Typography color="text.secondary">
              {status === 'error' ? `無法連線至後端伺服器，請確認 ${BACKEND_START_CMD} 已啟動` : '正在連線...'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Level 1: 永遠顯示 */}
            <MetricCards
              latest={latest}
              cpuAlert={cpuAlert}
              memAlert={memAlert}
              diskAlert={diskAlert}
            />

            {/* Level 2: 平板以上 */}
            {isTabletUp && <TrendCharts history={history} />}

            {/* Level 3: 桌面以上 */}
            {isDesktopUp && <DetailPanels latest={latest} />}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
