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
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  toggleProductActive
} = await import('../productsService.js')

describe('productsService', () => {
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

  describe('getProducts', () => {
    it('should fetch products with default parameters', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10.99, category: 'food' },
        { id: 2, name: 'Product 2', price: 15.50, category: 'drink' }
      ]
      const mockResponse = { data: mockProducts }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getProducts()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { _page: 1, _size: 10 }
      })
      expect(result).toEqual(mockProducts)
    })

    it('should fetch products with custom parameters', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1' }]
      const mockResponse = { data: mockProducts }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getProducts(2, 5, 'search term')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { _page: 2, _size: 5, search: 'search term' }
      })
      expect(result).toEqual(mockProducts)
    })

    it('should handle empty search term', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProducts(1, 10, '   ')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { _page: 1, _size: 10 }
      })
    })

    it('should handle search term with whitespace', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProducts(1, 10, '  search  ')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { _page: 1, _size: 10, search: 'search' }
      })
    })

    it('should handle error when fetching products', async () => {
      const mockError = new Error('Failed to fetch products')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getProducts()).rejects.toThrow('Failed to fetch products')
    })

    it('should handle empty product list', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getProducts()
      expect(result).toEqual([])
    })
  })

  describe('getProduct', () => {
    it('should fetch a single product by ID', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 10.99, category: 'food' }
      const mockResponse = { data: mockProduct }

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getProduct(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/1')
      expect(result).toEqual(mockProduct)
    })

    it('should handle product not found', async () => {
      const mockError = new Error('Product not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getProduct(999)).rejects.toThrow('Product not found')
    })

    it('should handle different product IDs', async () => {
      const mockResponse = { data: { id: 5, name: 'Product 5' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProduct(5)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/5')
    })

    it('should handle zero product ID', async () => {
      const mockResponse = { data: { id: 0, name: 'Product 0' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProduct(0)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/0')
    })
  })

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        price: 25.99,
        category: 'food',
        description: 'A delicious new product'
      }
      const mockResponse = { status: 201 }

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse)

      const result = await createProduct(productData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/products', productData)
      expect(result).toBe(201)
    })

    it('should handle validation errors', async () => {
      const productData = { name: '', price: -10 }
      const mockError = new Error('Validation failed')
      mockError.response = { status: 400 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createProduct(productData)).rejects.toThrow('Validation failed')
    })

    it('should handle duplicate product error', async () => {
      const productData = { name: 'Existing Product' }
      const mockError = new Error('Product already exists')
      mockError.response = { status: 409 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createProduct(productData)).rejects.toThrow('Product already exists')
    })

    it('should handle server error during creation', async () => {
      const productData = { name: 'Test Product' }
      const mockError = new Error('Server error')
      mockError.response = { status: 500 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createProduct(productData)).rejects.toThrow('Server error')
    })
  })

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const productData = {
        name: 'Updated Product',
        price: 30.99,
        category: 'drink'
      }
      const mockResponse = { status: 200 }

      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse)

      const result = await updateProduct(1, productData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/products/1', productData)
      expect(result).toBe(200)
    })

    it('should handle product not found during update', async () => {
      const productData = { name: 'Updated Product' }
      const mockError = new Error('Product not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateProduct(999, productData)).rejects.toThrow('Product not found')
    })

    it('should handle validation errors during update', async () => {
      const productData = { name: '', price: -5 }
      const mockError = new Error('Invalid data')
      mockError.response = { status: 400 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateProduct(1, productData)).rejects.toThrow('Invalid data')
    })

    it('should handle unauthorized access during update', async () => {
      const productData = { name: 'Updated Product' }
      const mockError = new Error('Unauthorized')
      mockError.response = { status: 401 }
      mockAxiosInstance.put.mockRejectedValueOnce(mockError)

      await expect(updateProduct(1, productData)).rejects.toThrow('Unauthorized')
    })
  })

  describe('toggleProductActive', () => {
    it('should toggle product active status', async () => {
      const mockResponse = { status: 200 }

      mockAxiosInstance.patch.mockResolvedValueOnce(mockResponse)

      const result = await toggleProductActive(1)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/products/1/toggle-status')
      expect(result).toBe(200)
    })

    it('should handle product not found during toggle', async () => {
      const mockError = new Error('Product not found')
      mockError.response = { status: 404 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleProductActive(999)).rejects.toThrow('Product not found')
    })

    it('should handle server error during toggle', async () => {
      const mockError = new Error('Server error')
      mockError.response = { status: 500 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleProductActive(1)).rejects.toThrow('Server error')
    })

    it('should handle forbidden access during toggle', async () => {
      const mockError = new Error('Forbidden')
      mockError.response = { status: 403 }
      mockAxiosInstance.patch.mockRejectedValueOnce(mockError)

      await expect(toggleProductActive(1)).rejects.toThrow('Forbidden')
    })
  })

  describe('api configuration', () => {
    it('should export api instance as default', async () => {
      const productsService = await import('../productsService.js')
      expect(productsService.default).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle negative product ID', async () => {
      const mockError = new Error('Invalid ID')
      mockError.response = { status: 400 }
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getProduct(-1)).rejects.toThrow('Invalid ID')
    })

    it('should handle very large product ID', async () => {
      const mockResponse = { data: { id: 999999999, name: 'Large ID Product' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProduct(999999999)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/999999999')
    })

    it('should handle string product ID', async () => {
      const mockResponse = { data: { id: '123', name: 'String ID Product' } }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProduct('123')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/123')
    })
  })

  describe('pagination edge cases', () => {
    it('should handle zero page number', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProducts(0, 10)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { _page: 0, _size: 10 }
      })
    })

    it('should handle zero size', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProducts(1, 0)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { _page: 1, _size: 0 }
      })
    })

    it('should handle very large page numbers', async () => {
      const mockResponse = { data: [] }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      await getProducts(999999, 10)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', {
        params: { _page: 999999, _size: 10 }
      })
    })
  })

  describe('data validation edge cases', () => {
    it('should handle null product data', async () => {
      const mockError = new Error('Invalid data')
      mockError.response = { status: 400 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createProduct(null)).rejects.toThrow('Invalid data')
    })

    it('should handle undefined product data', async () => {
      const mockError = new Error('Invalid data')
      mockError.response = { status: 400 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createProduct(undefined)).rejects.toThrow('Invalid data')
    })

    it('should handle empty object product data', async () => {
      const mockError = new Error('Validation failed')
      mockError.response = { status: 400 }
      mockAxiosInstance.post.mockRejectedValueOnce(mockError)

      await expect(createProduct({})).rejects.toThrow('Validation failed')
    })
  })

  describe('network error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getProducts()).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      const mockError = new Error('Request timeout')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      await expect(getProduct(1)).rejects.toThrow('Request timeout')
    })

    it('should handle malformed response data', async () => {
      const mockResponse = { data: null }
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getProducts()
      expect(result).toBeNull()
    })

    it('should handle undefined response data', async () => {
      const mockResponse = {}
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse)

      const result = await getProduct(1)
      expect(result).toBeUndefined()
    })
  })
})
