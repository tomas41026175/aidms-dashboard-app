import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Track all created EventSource instances
const instances: MockEventSource[] = []

class MockEventSource {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 2

  readyState = MockEventSource.CONNECTING
  url: string
  onerror: ((e: Event) => void) | null = null
  private listeners: Map<string, ((e: MessageEvent) => void)[]> = new Map()

  constructor(url: string) {
    this.url = url
    instances.push(this)
  }

  addEventListener(event: string, handler: (e: MessageEvent) => void) {
    const handlers = this.listeners.get(event) ?? []
    this.listeners.set(event, [...handlers, handler])
  }

  removeEventListener(event: string, handler: (e: MessageEvent) => void) {
    const handlers = this.listeners.get(event) ?? []
    this.listeners.set(event, handlers.filter(h => h !== handler))
  }

  emit(event: string, data: unknown) {
    const msg = new MessageEvent(event, { data: JSON.stringify(data) })
    const handlers = this.listeners.get(event) ?? []
    handlers.forEach(h => h(msg))
  }

  triggerError() {
    if (this.onerror) this.onerror(new Event('error'))
  }

  close() {
    this.readyState = MockEventSource.CLOSED
  }
}

vi.stubGlobal('EventSource', MockEventSource)

export { MockEventSource, instances }

export function getLastEventSource(): MockEventSource {
  const es = instances[instances.length - 1]
  if (!es) throw new Error('No EventSource instance found — did you forget to render a component that calls useSystemMetrics?')
  return es
}
