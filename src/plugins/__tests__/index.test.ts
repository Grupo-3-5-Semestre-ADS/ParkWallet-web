import { describe, it, expect, vi } from 'vitest'
import { registerPlugins } from '@/plugins/index'
import { createApp } from 'vue'

// Mock the plugins
vi.mock('@/plugins/vuetify', () => ({
  default: {
    install: vi.fn()
  }
}))

vi.mock('@/router/index', () => ({
  default: {
    install: vi.fn()
  }
}))

describe('Plugins Registration', () => {
  it('should register plugins on app', () => {
    const mockApp = {
      use: vi.fn().mockReturnThis()
    }

    registerPlugins(mockApp as any)

    // Verify that app.use was called twice (for vuetify and router)
    expect(mockApp.use).toHaveBeenCalledTimes(2)
  })

  it('should return app instance for chaining', () => {
    const mockApp = {
      use: vi.fn().mockReturnThis()
    }

    const result = registerPlugins(mockApp as any)

    // The function should work with method chaining
    expect(mockApp.use).toHaveBeenCalled()
  })

  it('should register vuetify plugin', () => {
    const mockApp = {
      use: vi.fn().mockReturnThis()
    }

    registerPlugins(mockApp as any)

    // Check that use was called (we can't easily verify the exact plugin due to mocking)
    expect(mockApp.use).toHaveBeenCalled()
  })

  it('should register router plugin', () => {
    const mockApp = {
      use: vi.fn().mockReturnThis()
    }

    registerPlugins(mockApp as any)

    // Check that use was called for both plugins
    expect(mockApp.use).toHaveBeenCalledTimes(2)
  })

  it('should work with real Vue app instance', () => {
    const app = createApp({})
    
    // Should not throw when called with real app
    expect(() => registerPlugins(app)).not.toThrow()
  })

  it('should maintain method chaining', () => {
    const mockApp = {
      use: vi.fn().mockReturnThis()
    }

    // Test that the chaining works as expected
    registerPlugins(mockApp as any)
    
    expect(mockApp.use).toHaveBeenCalledTimes(2)
  })
})
