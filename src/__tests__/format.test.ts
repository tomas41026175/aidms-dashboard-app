import { describe, it, expect } from 'vitest'
import { formatPercent, formatBytes, formatBps, formatGb } from '../utils/format'

describe('formatPercent', () => {
  it('formats to 1 decimal by default', () => {
    expect(formatPercent(73.2)).toBe('73.2%')
  })

  it('respects custom decimal places', () => {
    expect(formatPercent(70, 0)).toBe('70%')
  })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512.0 B')
  })

  it('formats KB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('formats GB', () => {
    expect(formatBytes(1024 ** 3)).toBe('1.0 GB')
  })
})

describe('formatBps', () => {
  it('formats bytes/sec', () => {
    expect(formatBps(500)).toBe('500 B/s')
  })

  it('formats KB/s', () => {
    expect(formatBps(1500)).toBe('1.5 KB/s')
  })

  it('formats MB/s', () => {
    expect(formatBps(2 * 1024 * 1024)).toBe('2.0 MB/s')
  })
})

describe('formatGb', () => {
  it('formats bytes to GB', () => {
    expect(formatGb(1024 ** 3)).toBe('1.0 GB')
  })
})
