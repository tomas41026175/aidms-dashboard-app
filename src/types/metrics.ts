export interface DiskPartition {
  device: string
  mountpoint: string
  totalGb: number
  usedGb: number
  freeGb: number
  usage: number
}

export interface SystemMetrics {
  timestamp: number
  cpu: {
    usage: number
    cores: number[]
  }
  memory: {
    total: number
    available: number
    usage: number
    swapUsage: number
  }
  disk: DiskPartition[]
  network: {
    rxBps: number
    txBps: number
  }
  loadAvg?: number[]
}

export interface HistoryPayload {
  metrics: SystemMetrics[]
}

export type AlertLevel = 'normal' | 'warning' | 'critical'

export type ConnectionStatus = 'connecting' | 'connected' | 'error'
