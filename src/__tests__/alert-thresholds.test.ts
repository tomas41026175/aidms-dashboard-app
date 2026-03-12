import { describe, it, expect } from 'vitest'
import {
  classifyValue,
  deriveAlertLevel,
  CPU_THRESHOLDS,
  MEM_THRESHOLDS,
  DISK_THRESHOLDS,
} from '../utils/alert-thresholds'
import type { SystemMetrics } from '../types/metrics'

function makeMetric(cpu: number, mem = 50, disk = 50): SystemMetrics {
  return {
    timestamp: Date.now(),
    cpu: { usage: cpu, cores: [cpu] },
    memory: { total: 1e9, available: 1e9 * (1 - mem / 100), usage: mem, swapUsage: 0 },
    disk: [{ device: '/dev/sda', mountpoint: '/', totalGb: 100, usedGb: disk, freeGb: 100 - disk, usage: disk }],
    network: { rxBps: 0, txBps: 0 },
  }
}

describe('classifyValue', () => {
  it('returns normal below warning threshold', () => {
    expect(classifyValue(50, CPU_THRESHOLDS)).toBe('normal')
  })

  it('returns warning above warning threshold', () => {
    expect(classifyValue(75, CPU_THRESHOLDS)).toBe('warning')
  })

  it('returns critical above critical threshold', () => {
    expect(classifyValue(90, CPU_THRESHOLDS)).toBe('critical')
  })

  it('returns normal at exactly warning threshold', () => {
    expect(classifyValue(70, CPU_THRESHOLDS)).toBe('normal')
  })

  it('returns warning at exactly critical threshold', () => {
    expect(classifyValue(85, CPU_THRESHOLDS)).toBe('warning')
  })
})

describe('deriveAlertLevel', () => {
  it('returns normal with fewer than 3 data points', () => {
    const history = [makeMetric(90), makeMetric(90)]
    expect(deriveAlertLevel(history, m => m.cpu.usage, CPU_THRESHOLDS)).toBe('normal')
  })

  it('returns normal when values are below warning', () => {
    const history = [makeMetric(50), makeMetric(60), makeMetric(65)]
    expect(deriveAlertLevel(history, m => m.cpu.usage, CPU_THRESHOLDS)).toBe('normal')
  })

  it('returns warning when last 3 are all above warning', () => {
    const history = [makeMetric(50), makeMetric(75), makeMetric(75), makeMetric(75)]
    expect(deriveAlertLevel(history, m => m.cpu.usage, CPU_THRESHOLDS)).toBe('warning')
  })

  it('returns critical when last 3 are all critical', () => {
    const history = [makeMetric(50), makeMetric(90), makeMetric(90), makeMetric(90)]
    expect(deriveAlertLevel(history, m => m.cpu.usage, CPU_THRESHOLDS)).toBe('critical')
  })

  it('does NOT trigger on single spike (alert storm prevention)', () => {
    const history = [makeMetric(50), makeMetric(90), makeMetric(50)]
    expect(deriveAlertLevel(history, m => m.cpu.usage, CPU_THRESHOLDS)).toBe('normal')
  })

  it('works with memory thresholds', () => {
    const history = [makeMetric(50, 80), makeMetric(50, 80), makeMetric(50, 80)]
    expect(deriveAlertLevel(history, m => m.memory.usage, MEM_THRESHOLDS)).toBe('warning')
  })

  it('works with disk thresholds', () => {
    const history = [makeMetric(50, 50, 85), makeMetric(50, 50, 85), makeMetric(50, 50, 85)]
    expect(deriveAlertLevel(history, m => m.disk[0]?.usage ?? 0, DISK_THRESHOLDS)).toBe('warning')
  })
})
