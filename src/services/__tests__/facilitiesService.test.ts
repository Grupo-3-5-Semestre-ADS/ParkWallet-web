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
  getFacilities,
  getFacility,
  getFacilityProducts,
  getFacilityTransactions,
  createFacility,
  updateFacility,
  toggleFacilityActive
} = await import('../facilitiesService.js')

describe('facilitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    })
  })

  describe('getFacilities', () => {
    it('should fetch facilities with default parameters', async () => {
      const mockFacilities = [
        { id: 1, name: 'Facility 1', type: 'store' },
        { id: 2, name: 'Facility 2', type: 'attraction' }
      ]
      const mockResponse = { data: mockFacilities }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getFacilities()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities', {
        params: { _page: 1, _size: 10 }
      })
      expect(result).toEqual(mockFacilities)
    })

    it('should fetch facilities with custom parameters', async () => {
      const mockFacilities = [{ id: 1, name: 'Facility 1' }]
      const mockResponse = { data: mockFacilities }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getFacilities(2, 5, 'search term')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities', {
        params: { _page: 2, _size: 5, search: 'search term' }
      })
      expect(result).toEqual(mockFacilities)
    })

    it('should handle empty search term', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacilities(1, 10, '   ')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities', {
        params: { _page: 1, _size: 10 }
      })
    })

    it('should handle search term with whitespace', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacilities(1, 10, '  search  ')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities', {
        params: { _page: 1, _size: 10, search: 'search' }
      })
    })

    it('should handle error when fetching facilities', async () => {
      const mockError = new Error('Failed to fetch facilities')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getFacilities()).rejects.toThrow('Failed to fetch facilities')
    })
  })

  describe('getFacility', () => {
    it('should fetch a single facility by ID', async () => {
      const mockFacility = { id: 1, name: 'Facility 1', type: 'store' }
      const mockResponse = { data: mockFacility }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getFacility(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/1')
      expect(result).toEqual(mockFacility)
    })

    it('should handle facility not found', async () => {
      const mockError = new Error('Facility not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getFacility(999)).rejects.toThrow('Facility not found')
    })

    it('should handle different facility IDs', async () => {
      const mockResponse = { data: { id: 5, name: 'Facility 5' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacility(5)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/5')
    })
  })

  describe('getFacilityProducts', () => {
    it('should fetch products for a facility', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10.99 },
        { id: 2, name: 'Product 2', price: 15.50 }
      ]
      const mockResponse = { data: mockProducts }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getFacilityProducts(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/1/products')
      expect(result).toEqual(mockProducts)
    })

    it('should handle facility with no products', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getFacilityProducts(1)
      expect(result).toEqual([])
    })

    it('should handle error when fetching products', async () => {
      const mockError = new Error('Failed to fetch products')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getFacilityProducts(1)).rejects.toThrow('Failed to fetch products')
    })
  })

  describe('getFacilityTransactions', () => {
    it('should fetch transactions with default parameters', async () => {
      const mockTransactions = [
        { id: 1, amount: 25.99, status: 'completed' },
        { id: 2, amount: 15.50, status: 'pending' }
      ]
      const mockResponse = { data: mockTransactions }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getFacilityTransactions(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/1/transactions', {
        params: { _page: 1, _size: 10 }
      })
      expect(result).toEqual(mockTransactions)
    })

    it('should fetch transactions with custom parameters', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacilityTransactions(1, 3, 20)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/1/transactions', {
        params: { _page: 3, _size: 20 }
      })
    })

    it('should handle facility with no transactions', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getFacilityTransactions(1)
      expect(result).toEqual([])
    })
  })

  describe('createFacility', () => {
    it('should create a new facility', async () => {
      const facilityData = {
        name: 'New Facility',
        type: 'store',
        address: '123 Main St'
      }
      const mockResponse = { status: 201 }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await createFacility(facilityData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/facilities', facilityData)
      expect(result).toBe(201)
    })

    it('should handle validation errors', async () => {
      const facilityData = { name: '' }
      const mockError = new Error('Validation failed')
      mockError.response = { status: 400 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createFacility(facilityData)).rejects.toThrow('Validation failed')
    })

    it('should handle duplicate facility error', async () => {
      const facilityData = { name: 'Existing Facility' }
      const mockError = new Error('Facility already exists')
      mockError.response = { status: 409 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createFacility(facilityData)).rejects.toThrow('Facility already exists')
    })
  })

  describe('updateFacility', () => {
    it('should update an existing facility', async () => {
      const facilityData = {
        name: 'Updated Facility',
        type: 'attraction'
      }
      const mockResponse = { status: 200 }

      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await updateFacility(1, facilityData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/facilities/1', facilityData)
      expect(result).toBe(200)
    })

    it('should handle facility not found during update', async () => {
      const facilityData = { name: 'Updated Facility' }
      const mockError = new Error('Facility not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateFacility(999, facilityData)).rejects.toThrow('Facility not found')
    })

    it('should handle validation errors during update', async () => {
      const facilityData = { name: '' }
      const mockError = new Error('Invalid data')
      mockError.response = { status: 400 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateFacility(1, facilityData)).rejects.toThrow('Invalid data')
    })
  })

  describe('toggleFacilityActive', () => {
    it('should toggle facility active status', async () => {
      const mockResponse = { status: 200 }

      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)

      const result = await toggleFacilityActive(1)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/facilities/1/toggle-status')
      expect(result).toBe(200)
    })

    it('should handle facility not found during toggle', async () => {
      const mockError = new Error('Facility not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleFacilityActive(999)).rejects.toThrow('Facility not found')
    })

    it('should handle server error during toggle', async () => {
      const mockError = new Error('Server error')
      mockError.response = { status: 500 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleFacilityActive(1)).rejects.toThrow('Server error')
    })
  })

  describe('api configuration', () => {
    it('should export api instance as default', async () => {
      const facilitiesService = await import('../facilitiesService.js')
      expect(facilitiesService.default).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle zero facility ID', async () => {
      const mockResponse = { data: { id: 0, name: 'Facility 0' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacility(0)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/0')
    })

    it('should handle negative facility ID', async () => {
      const mockError = new Error('Invalid ID')
      mockError.response = { status: 400 }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getFacility(-1)).rejects.toThrow('Invalid ID')
    })

    it('should handle very large facility ID', async () => {
      const mockResponse = { data: { id: 999999999, name: 'Large ID Facility' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacility(999999999)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/999999999')
    })

    it('should handle string facility ID', async () => {
      const mockResponse = { data: { id: '123', name: 'String ID Facility' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacility('123')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities/123')
    })
  })

  describe('pagination edge cases', () => {
    it('should handle zero page number', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacilities(0, 10)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities', {
        params: { _page: 0, _size: 10 }
      })
    })

    it('should handle zero size', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacilities(1, 0)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities', {
        params: { _page: 1, _size: 0 }
      })
    })

    it('should handle very large page numbers', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getFacilities(999999, 10)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/facilities', {
        params: { _page: 999999, _size: 10 }
      })
    })
  })
})
