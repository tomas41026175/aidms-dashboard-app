import type { AlertLevel, SystemMetrics } from '../types/metrics'
export type { AlertLevel } from '../types/metrics'

export interface Thresholds {
  warning: number
  critical: number
}

export const CPU_THRESHOLDS: Thresholds = { warning: 70, critical: 85 }
export const MEM_THRESHOLDS: Thresholds = { warning: 75, critical: 90 }
export const DISK_THRESHOLDS: Thresholds = { warning: 80, critical: 90 }
export const SWAP_THRESHOLDS: Thresholds = { warning: 10, critical: 50 }

// 連續 3 點才觸發：過濾 cron/GC 等短暫 spike，避免 alert storm
const CONSECUTIVE = 3

export function classifyValue(value: number, thresholds: Thresholds): AlertLevel {
  if (value > thresholds.critical) return 'critical'
  if (value > thresholds.warning) return 'warning'
  return 'normal'
}

export function deriveAlertLevel(
  recentHistory: SystemMetrics[],
  extractor: (m: SystemMetrics) => number,
  thresholds: Thresholds,
): AlertLevel {
  if (recentHistory.length < CONSECUTIVE) return 'normal'

  const lastN = recentHistory.slice(-CONSECUTIVE)
  const levels = lastN.map(m => classifyValue(extractor(m), thresholds))

  if (levels.every(l => l === 'critical')) return 'critical'
  if (levels.every(l => l !== 'normal')) return 'warning'
  return 'normal'
}

export function worstDiskUsage(metrics: SystemMetrics): number {
  if (metrics.disk.length === 0) return 0
  return Math.max(...metrics.disk.map(d => d.usage))
}
