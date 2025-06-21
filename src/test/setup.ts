import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { vuetifyComponents } from './mocks/vuetify'

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    id: 1,
    email: 'test@test.com',
    role: 'USER',
    exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
  }))
}))

// Mock router
vi.mock('@/router/index.ts', () => ({
  default: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }
}))

// Configure global components for Vue Test Utils
config.global.components = {
  ...vuetifyComponents
}

// Mock localStorage with a valid JWT token
const localStorageMock = {
  getItem: vi.fn((key) => {
    if (key === 'authToken') {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJleHAiOjk5OTk5OTk5OTl9.test'
    }
    return null
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GATEWAY_URL: 'http://localhost:8080',
    MODE: 'test'
  }
})

// Mock console to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
  info: vi.fn()
}
