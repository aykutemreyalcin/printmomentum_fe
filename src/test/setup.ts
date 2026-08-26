import '@testing-library/jest-dom/vitest'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
})

const memory = new Map<string, string>()

const localStorageMock: Storage = {
  get length() {
    return memory.size
  },
  clear() {
    memory.clear()
  },
  getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null
  },
  key(index: number) {
    return [...memory.keys()][index] ?? null
  },
  removeItem(key: string) {
    memory.delete(key)
  },
  setItem(key: string, value: string) {
    memory.set(key, value)
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
})
