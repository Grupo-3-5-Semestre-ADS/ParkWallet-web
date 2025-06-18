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
  listUserChats,
  listConversations
} = await import('../chatService.js')

describe('chatService', () => {
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

  describe('listUserChats', () => {
    it('should fetch user chats successfully', async () => {
      const userId = 1
      const mockChats = [
        {
          id: 1,
          senderUserId: 1,
          recipientUserId: 2,
          message: 'Hello, how can I help you?',
          wasRead: false,
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: 2,
          senderUserId: 2,
          recipientUserId: 1,
          message: 'I need help with my order',
          wasRead: true,
          createdAt: '2024-01-01T10:05:00Z'
        }
      ]
      const mockResponse = { data: mockChats }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await listUserChats(userId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/1')
      expect(result).toEqual(mockChats)
    })

    it('should handle empty chat list', async () => {
      const userId = 1
      const mockResponse = { data: [] }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await listUserChats(userId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/1')
      expect(result).toEqual([])
    })

    it('should handle user not found error', async () => {
      const userId = 999
      const mockError = new Error('User not found')
      mockError.response = { status: 404 }

      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listUserChats(userId)).rejects.toThrow('User not found')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/999')
    })

    it('should handle unauthorized access', async () => {
      const userId = 1
      const mockError = new Error('Unauthorized')
      mockError.response = { status: 401 }

      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listUserChats(userId)).rejects.toThrow('Unauthorized')
    })

    it('should handle different user IDs', async () => {
      const userIds = [1, 5, 10, 100]
      const mockResponse = { data: [] }

      for (const userId of userIds) {
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)
        
        await listUserChats(userId)
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/chats/${userId}`)
      }
    })
  })

  describe('listConversations', () => {
    it('should fetch conversations successfully', async () => {
      const mockConversations = [
        {
          userId: 2,
          userName: 'John Doe',
          lastMessage: 'Thank you for your help!'
        },
        {
          userId: 3,
          userName: 'Jane Smith',
          lastMessage: 'When will my order arrive?'
        }
      ]
      const mockResponse = { data: mockConversations }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await listConversations()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/conversations')
      expect(result).toEqual(mockConversations)
    })

    it('should handle empty conversations list', async () => {
      const mockResponse = { data: [] }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await listConversations()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/conversations')
      expect(result).toEqual([])
    })

    it('should handle unauthorized access to conversations', async () => {
      const mockError = new Error('Unauthorized')
      mockError.response = { status: 401 }

      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listConversations()).rejects.toThrow('Unauthorized')
    })

    it('should handle forbidden access (insufficient permissions)', async () => {
      const mockError = new Error('Forbidden')
      mockError.response = { status: 403 }

      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listConversations()).rejects.toThrow('Forbidden')
    })

    it('should handle server errors', async () => {
      const mockError = new Error('Internal Server Error')
      mockError.response = { status: 500 }

      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listConversations()).rejects.toThrow('Internal Server Error')
    })
  })

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listUserChats(1)).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      const mockError = new Error('Request timeout')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listConversations()).rejects.toThrow('Request timeout')
    })

    it('should handle malformed response data', async () => {
      const mockResponse = { data: null }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await listUserChats(1)
      expect(result).toBeNull()
    })

    it('should handle undefined response data', async () => {
      const mockResponse = {}
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await listConversations()
      expect(result).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle zero user ID', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await listUserChats(0)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/0')
    })

    it('should handle negative user ID', async () => {
      const mockError = new Error('Invalid ID')
      mockError.response = { status: 400 }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(listUserChats(-1)).rejects.toThrow('Invalid ID')
    })

    it('should handle very large user ID', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await listUserChats(999999999)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/999999999')
    })

    it('should handle string user ID', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await listUserChats('123')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/123')
    })
  })

  describe('collection constant', () => {
    it('should use correct collection path', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await listUserChats(1)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/1')

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)
      await listConversations()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chats/conversations')
    })
  })
})
