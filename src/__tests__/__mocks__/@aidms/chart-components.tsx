import { vi } from 'vitest'

export const LineChart = vi.fn(() => <div data-testid="line-chart" />)
export const BarChart = vi.fn(() => <div data-testid="bar-chart" />)
export const GaugeChart = vi.fn(({ value }: { value: number }) => (
  <div data-testid="gauge-chart" data-value={value} />
))
export type Dataset = { label: string; data: (number | null)[]; color?: string }
export type LineChartProps = object
export type BarChartProps = object
export type GaugeChartProps = object
