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

// Mock axios and router
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance)
  }
}))

vi.mock('@/router/index.ts', () => ({
  default: {
    push: vi.fn()
  }
}))

// Now import the service
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  toggleUserActive,
  updateUserRole
} = await import('../usersService.js')

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    })
  })

  describe('getUsers', () => {
    it('should fetch users with default parameters', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
      ]
      const mockResponse = { data: mockUsers }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getUsers()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
        params: { _page: 1, _size: 10 }
      })
      expect(result).toEqual(mockUsers)
    })

    it('should fetch users with custom parameters', async () => {
      const mockUsers = [{ id: 1, name: 'John Doe' }]
      const mockResponse = { data: mockUsers }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getUsers(2, 5, 'search term')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
        params: { _page: 2, _size: 5, search: 'search term' }
      })
      expect(result).toEqual(mockUsers)
    })

    it('should handle empty search term', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUsers(1, 10, '   ')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
        params: { _page: 1, _size: 10 }
      })
    })

    it('should handle search term with whitespace', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUsers(1, 10, '  search  ')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
        params: { _page: 1, _size: 10, search: 'search' }
      })
    })

    it('should handle error when fetching users', async () => {
      const mockError = new Error('Failed to fetch users')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getUsers()).rejects.toThrow('Failed to fetch users')
    })

    it('should handle empty user list', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getUsers()
      expect(result).toEqual([])
    })
  })

  describe('getUser', () => {
    it('should fetch a single user by ID', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' }
      const mockResponse = { data: mockUser }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getUser(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/1')
      expect(result).toEqual(mockUser)
    })

    it('should handle user not found', async () => {
      const mockError = new Error('User not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getUser(999)).rejects.toThrow('User not found')
    })

    it('should handle different user IDs', async () => {
      const mockResponse = { data: { id: 5, name: 'User 5' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUser(5)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/5')
    })

    it('should handle zero user ID', async () => {
      const mockResponse = { data: { id: 0, name: 'User 0' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUser(0)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/0')
    })
  })

  describe('addUser', () => {
    it('should add a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user'
      }
      const mockResponse = { status: 201 }

      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await addUser(1, userData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users', userData)
      expect(result).toBe(201)
    })

    it('should handle validation errors', async () => {
      const userData = { name: '', email: 'invalid-email' }
      const mockError = new Error('Validation failed')
      mockError.response = { status: 400 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(addUser(1, userData)).rejects.toThrow('Validation failed')
    })

    it('should handle duplicate user error', async () => {
      const userData = { email: 'existing@example.com' }
      const mockError = new Error('User already exists')
      mockError.response = { status: 409 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(addUser(1, userData)).rejects.toThrow('User already exists')
    })

    it('should handle server error during creation', async () => {
      const userData = { name: 'Test User' }
      const mockError = new Error('Server error')
      mockError.response = { status: 500 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(addUser(1, userData)).rejects.toThrow('Server error')
    })
  })

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const userData = {
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'admin'
      }
      const mockResponse = { status: 200 }

      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await updateUser(1, userData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', userData)
      expect(result).toBe(200)
    })

    it('should handle user not found during update', async () => {
      const userData = { name: 'Updated User' }
      const mockError = new Error('User not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateUser(999, userData)).rejects.toThrow('User not found')
    })

    it('should handle validation errors during update', async () => {
      const userData = { name: '', email: 'invalid' }
      const mockError = new Error('Invalid data')
      mockError.response = { status: 400 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateUser(1, userData)).rejects.toThrow('Invalid data')
    })

    it('should handle unauthorized access during update', async () => {
      const userData = { name: 'Updated User' }
      const mockError = new Error('Unauthorized')
      mockError.response = { status: 401 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateUser(1, userData)).rejects.toThrow('Unauthorized')
    })
  })

  describe('toggleUserActive', () => {
    it('should toggle user active status', async () => {
      const mockResponse = { status: 200 }

      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)

      const result = await toggleUserActive(1)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1/toggle-status')
      expect(result).toBe(200)
    })

    it('should handle user not found during toggle', async () => {
      const mockError = new Error('User not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleUserActive(999)).rejects.toThrow('User not found')
    })

    it('should handle server error during toggle', async () => {
      const mockError = new Error('Server error')
      mockError.response = { status: 500 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleUserActive(1)).rejects.toThrow('Server error')
    })

    it('should handle forbidden access during toggle', async () => {
      const mockError = new Error('Forbidden')
      mockError.response = { status: 403 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleUserActive(1)).rejects.toThrow('Forbidden')
    })
  })

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const roleData = { role: 'admin' }
      const mockResponse = { status: 200 }

      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)

      const result = await updateUserRole(1, roleData)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1/role', roleData)
      expect(result).toBe(200)
    })

    it('should handle user not found during role update', async () => {
      const roleData = { role: 'admin' }
      const mockError = new Error('User not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(updateUserRole(999, roleData)).rejects.toThrow('User not found')
    })

    it('should handle invalid role', async () => {
      const roleData = { role: 'invalid_role' }
      const mockError = new Error('Invalid role')
      mockError.response = { status: 400 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(updateUserRole(1, roleData)).rejects.toThrow('Invalid role')
    })

    it('should handle unauthorized role update', async () => {
      const roleData = { role: 'admin' }
      const mockError = new Error('Unauthorized')
      mockError.response = { status: 401 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(updateUserRole(1, roleData)).rejects.toThrow('Unauthorized')
    })

    it('should handle different role values', async () => {
      const roles = ['user', 'admin', 'moderator']
      const mockResponse = { status: 200 }

      for (const role of roles) {
        mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)
        
        await updateUserRole(1, { role })
        
        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1/role', { role })
      }
    })
  })

  describe('api configuration', () => {
    it('should export api instance as default', async () => {
      const usersService = await import('../usersService.js')
      expect(usersService.default).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle negative user ID', async () => {
      const mockError = new Error('Invalid ID')
      mockError.response = { status: 400 }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getUser(-1)).rejects.toThrow('Invalid ID')
    })

    it('should handle very large user ID', async () => {
      const mockResponse = { data: { id: 999999999, name: 'Large ID User' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUser(999999999)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/999999999')
    })

    it('should handle string user ID', async () => {
      const mockResponse = { data: { id: '123', name: 'String ID User' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUser('123')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/123')
    })
  })

  describe('pagination edge cases', () => {
    it('should handle zero page number', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUsers(0, 10)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
        params: { _page: 0, _size: 10 }
      })
    })

    it('should handle zero size', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUsers(1, 0)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
        params: { _page: 1, _size: 0 }
      })
    })

    it('should handle very large page numbers', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getUsers(999999, 10)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
        params: { _page: 999999, _size: 10 }
      })
    })
  })

  describe('data validation edge cases', () => {
    it('should handle null user data', async () => {
      const mockError = new Error('Invalid data')
      mockError.response = { status: 400 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(addUser(1, null)).rejects.toThrow('Invalid data')
    })

    it('should handle undefined user data', async () => {
      const mockError = new Error('Invalid data')
      mockError.response = { status: 400 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(addUser(1, undefined)).rejects.toThrow('Invalid data')
    })

    it('should handle empty object user data', async () => {
      const mockError = new Error('Validation failed')
      mockError.response = { status: 400 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(addUser(1, {})).rejects.toThrow('Validation failed')
    })
  })

  describe('network error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getUsers()).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      const mockError = new Error('Request timeout')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getUser(1)).rejects.toThrow('Request timeout')
    })

    it('should handle malformed response data', async () => {
      const mockResponse = { data: null }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getUsers()
      expect(result).toBeNull()
    })

    it('should handle undefined response data', async () => {
      const mockResponse = {}
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getUser(1)
      expect(result).toBeUndefined()
    })
  })
})
