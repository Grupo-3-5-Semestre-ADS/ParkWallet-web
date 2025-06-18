import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock before any imports
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
}

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance)
  }
}))

// Now import the service
const { login } = await import('../authService.js')

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockLoginData = { email: 'test@test.com', password: 'password123' }
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          user: { id: 1, email: 'test@test.com', name: 'Test User' }
        }
      }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await login(mockLoginData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/login', mockLoginData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle login failure', async () => {
      const mockLoginData = { email: 'invalid@test.com', password: 'wrongpassword' }
      const mockError = new Error('Invalid credentials')

      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(login(mockLoginData)).rejects.toThrow('Invalid credentials')
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/login', mockLoginData)
    })

    it('should handle network errors', async () => {
      const mockLoginData = { email: 'test@test.com', password: 'password123' }
      const mockError = new Error('Network Error')

      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(login(mockLoginData)).rejects.toThrow('Network Error')
    })
  })
})
