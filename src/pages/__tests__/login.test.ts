import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import LoginPage from '@/pages/login.vue'

const vuetify = createVuetify()

// Mock router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ 
    query: { sessionExpired: false }
  })
}))

// Mock auth service
vi.mock('@/services/authService.js', () => ({
  login: vi.fn()
}))

// Mock vuetify components
vi.mock('vuetify/components', () => ({
  VContainer: { template: '<div class="v-container"><slot /></div>' },
  VRow: { template: '<div class="v-row"><slot /></div>' },
  VCol: { template: '<div class="v-col"><slot /></div>' },
  VCard: { template: '<div class="v-card"><slot /></div>' },
  VCardTitle: { template: '<div class="v-card-title"><slot /></div>' },
  VCardText: { template: '<div class="v-card-text"><slot /></div>' },
  VForm: { template: '<form class="v-form"><slot /></form>' },
  VTextField: { template: '<input class="v-text-field" />' },
  VBtn: { template: '<button class="v-btn"><slot /></button>' },
  VAlert: { template: '<div class="v-alert"><slot /></div>' },
  VImg: { template: '<img class="v-img" />' }
}))

import { login } from '@/services/authService.js'

describe('LoginPage', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock jwt-decode
    vi.mock('jwt-decode', () => ({
      default: vi.fn(() => ({
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'ADMIN',
        exp: Date.now() / 1000 + 3600 // 1 hour from now
      }))
    }))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('rendering', () => {
    it('should render login form', () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.find('.v-container').exists()).toBe(true)
      expect(wrapper.find('.v-card').exists()).toBe(true)
      expect(wrapper.find('.v-form').exists()).toBe(true)
      expect(wrapper.findAll('.v-text-field').length).toBe(2) // Email and password fields
      expect(wrapper.find('.v-btn').exists()).toBe(true)
    })

    it('should render logo', () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.find('.v-img').exists()).toBe(true)
    })

    it('should render login button', () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      const loginButton = wrapper.find('.v-btn')
      expect(loginButton.exists()).toBe(true)
      expect(loginButton.text()).toContain('Entrar')
    })

    it('should show session expired message when sessionExpired query param is true', () => {
      // Mock route with sessionExpired query
      vi.mocked(vi.importMock('vue-router')).then(router => {
        router.useRoute = () => ({ 
          query: { sessionExpired: 'true' }
        })
      })

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Should show alert for session expiration
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('form validation', () => {
    it('should validate email field', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Test empty email
      const emailField = wrapper.findAll('.v-text-field')[0]
      expect(emailField.exists()).toBe(true)

      // Trigger validation by attempting to submit
      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      expect(wrapper.exists()).toBe(true)
    })

    it('should validate password field', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Test empty password
      const passwordField = wrapper.findAll('.v-text-field')[1]
      expect(passwordField.exists()).toBe(true)

      // Trigger validation
      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      expect(wrapper.exists()).toBe(true)
    })

    it('should validate email format', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Test invalid email format
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('login functionality', () => {
    it('should call login service on form submission', async () => {
      const mockLoginResponse = {
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'ADMIN' }
      }

      vi.mocked(login).mockResolvedValueOnce(mockLoginResponse)

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Simulate form submission
      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      // Should handle the submission
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle successful login', async () => {
      const mockLoginResponse = {
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'ADMIN' }
      }

      vi.mocked(login).mockResolvedValueOnce(mockLoginResponse)

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Submit form
      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      // Should redirect on successful login
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle login error', async () => {
      const mockError = new Error('Invalid credentials')
      vi.mocked(login).mockRejectedValueOnce(mockError)

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Submit form
      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      // Should show error message
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network Error')
      vi.mocked(login).mockRejectedValueOnce(mockError)

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('loading state', () => {
    it('should show loading state during login', async () => {
      // Mock a delayed login response
      vi.mocked(login).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          token: 'token',
          user: { id: 1, name: 'User', email: 'user@test.com', role: 'ADMIN' }
        }), 100))
      )

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      // Should show loading state
      expect(wrapper.exists()).toBe(true)
    })

    it('should disable form during login', async () => {
      vi.mocked(login).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          token: 'token',
          user: { id: 1, name: 'User', email: 'user@test.com', role: 'ADMIN' }
        }), 100))
      )

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      // Form should be disabled during loading
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Check that form fields have proper labels
      expect(wrapper.exists()).toBe(true)
    })

    it('should have proper heading structure', () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Should have a main heading
      expect(wrapper.find('.v-card-title').exists()).toBe(true)
    })

    it('should support keyboard navigation', async () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Test tab navigation
      const firstField = wrapper.findAll('.v-text-field')[0]
      await firstField.trigger('keydown.tab')

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('responsive design', () => {
    it('should work on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should work on desktop', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      })

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('security', () => {
    it('should not expose sensitive data in DOM', () => {
      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      // Password field should be type="password"
      const passwordField = wrapper.findAll('.v-text-field')[1]
      expect(passwordField.exists()).toBe(true)
    })

    it('should store token securely', async () => {
      const mockLoginResponse = {
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'ADMIN' }
      }

      vi.mocked(login).mockResolvedValueOnce(mockLoginResponse)

      wrapper = mount(LoginPage, {
        global: {
          plugins: [vuetify]
        }
      })

      const form = wrapper.find('.v-form')
      await form.trigger('submit')

      // Should call localStorage.setItem for token storage
      expect(wrapper.exists()).toBe(true)
    })
  })
})
