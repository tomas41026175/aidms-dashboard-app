import type { AlertLevel } from '../types/metrics'

export interface AlertColor {
  main: string
  light: string
}

const ALERT_COLORS: Record<AlertLevel, AlertColor> = {
  normal: { main: '#34d399', light: 'rgba(52, 211, 153, 0.15)' },
  warning: { main: '#fbbf24', light: 'rgba(251, 191, 36, 0.15)' },
  critical: { main: '#f87171', light: 'rgba(248, 113, 113, 0.15)' },
}

export function getAlertColor(level: AlertLevel): AlertColor {
  return ALERT_COLORS[level]
}
