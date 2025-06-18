import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test utility functions that might exist in the application
describe('Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatters', () => {
    it('should format currency values', () => {
      const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value)
      }

      const result1 = formatCurrency(10.50)
      const result2 = formatCurrency(100)
      const result3 = formatCurrency(0)
      const result4 = formatCurrency(999.99)
      
      // Test that the formatting includes currency symbol and proper decimal places
      expect(result1).toMatch(/R\$[\s\u00A0]?10,50/)
      expect(result2).toMatch(/R\$[\s\u00A0]?100,00/)
      expect(result3).toMatch(/R\$[\s\u00A0]?0,00/)
      expect(result4).toMatch(/R\$[\s\u00A0]?999,99/)
    })

    it('should format dates', () => {
      const formatDate = (dateString: string): string => {
        const date = new Date(dateString + 'T00:00:00.000Z') // Add time to avoid timezone issues
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      }

      const result1 = formatDate('2024-01-01')
      const result2 = formatDate('2024-12-31')
      
      // Test that the formatting follows DD/MM/YYYY pattern
      expect(result1).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      expect(result2).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      
      // More flexible check for the actual dates
      expect(result1).toMatch(/01\/01\/2024/)
      expect(result2).toMatch(/31\/12\/2024/)
    })

    it('should format timestamps', () => {
      const formatTimestamp = (timestamp: string | Date): string => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      const testDate = new Date('2024-01-01T14:30:00')
      const result = formatTimestamp(testDate)
      
      // Check that it returns time format HH:MM (could be 12h or 24h depending on locale)
      expect(result).toMatch(/\d{1,2}:\d{2}/)
      expect(formatTimestamp('')).toBe('')
      
      const result2 = formatTimestamp('2024-01-01T09:15:00')
      expect(result2).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('validators', () => {
    it('should validate email addresses', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid.email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should validate CPF format', () => {
      const isValidCPF = (cpf: string): boolean => {
        if (!cpf) return true // Optional field
        const cleanCPF = cpf.replace(/\D/g, '')
        return cleanCPF.length === 11 && /^\d+$/.test(cleanCPF)
      }

      expect(isValidCPF('12345678901')).toBe(true)
      expect(isValidCPF('123.456.789-01')).toBe(true)
      expect(isValidCPF('123456789')).toBe(false) // Too short
      expect(isValidCPF('123456789012')).toBe(false) // Too long
      expect(isValidCPF('1234567890a')).toBe(false) // Contains letter
      expect(isValidCPF('')).toBe(true) // Optional
    })

    it('should validate password strength', () => {
      const isStrongPassword = (password: string): boolean => {
        if (password.length < 8) return false
        if (!/[A-Za-z]/.test(password)) return false
        if (!/\d/.test(password)) return false
        return true
      }

      expect(isStrongPassword('password123')).toBe(true)
      expect(isStrongPassword('Password1')).toBe(true)
      expect(isStrongPassword('12345678')).toBe(false) // No letters
      expect(isStrongPassword('password')).toBe(false) // No numbers
      expect(isStrongPassword('Pass1')).toBe(false) // Too short
      expect(isStrongPassword('')).toBe(false)
    })

    it('should validate required fields', () => {
      const isRequired = (value: any): boolean => {
        if (typeof value === 'string') return value.trim().length > 0
        return value !== null && value !== undefined
      }

      expect(isRequired('test')).toBe(true)
      expect(isRequired('  test  ')).toBe(true)
      expect(isRequired('')).toBe(false)
      expect(isRequired('   ')).toBe(false)
      expect(isRequired(null)).toBe(false)
      expect(isRequired(undefined)).toBe(false)
      expect(isRequired(0)).toBe(true)
      expect(isRequired(false)).toBe(true)
    })
  })

  describe('array utilities', () => {
    it('should remove item from array', () => {
      const removeFromArray = <T>(array: T[], item: T): T[] => {
        return array.filter(arrayItem => arrayItem !== item)
      }

      const numbers = [1, 2, 3, 4, 5]
      const result = removeFromArray(numbers, 3)
      expect(result).toEqual([1, 2, 4, 5])
      expect(result).not.toContain(3)

      const strings = ['a', 'b', 'c']
      const stringResult = removeFromArray(strings, 'b')
      expect(stringResult).toEqual(['a', 'c'])
    })

    it('should find item by id', () => {
      const findById = <T extends { id: number }>(array: T[], id: number): T | undefined => {
        return array.find(item => item.id === id)
      }

      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]

      expect(findById(items, 2)).toEqual({ id: 2, name: 'Item 2' })
      expect(findById(items, 5)).toBeUndefined()
      expect(findById([], 1)).toBeUndefined()
    })

    it('should update item in array', () => {
      const updateInArray = <T extends { id: number }>(
        array: T[], 
        id: number, 
        updates: Partial<T>
      ): T[] => {
        return array.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      }

      const items = [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: false }
      ]

      const updated = updateInArray(items, 1, { name: 'Updated Item 1' })
      expect(updated[0]).toEqual({ id: 1, name: 'Updated Item 1', active: true })
      expect(updated[1]).toEqual({ id: 2, name: 'Item 2', active: false })
    })
  })

  describe('string utilities', () => {
    it('should capitalize first letter', () => {
      const capitalize = (str: string): string => {
        if (!str) return str
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      }

      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
      expect(capitalize('tEST')).toBe('Test')
      expect(capitalize('')).toBe('')
      expect(capitalize('a')).toBe('A')
    })

    it('should truncate text', () => {
      const truncate = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength - 3) + '...'
      }

      expect(truncate('Hello World', 20)).toBe('Hello World')
      expect(truncate('This is a very long text', 10)).toBe('This is...')
      expect(truncate('Short', 10)).toBe('Short')
      expect(truncate('', 5)).toBe('')
    })

    it('should remove special characters', () => {
      const removeSpecialChars = (str: string): string => {
        return str.replace(/[^a-zA-Z0-9\s]/g, '')
      }

      expect(removeSpecialChars('Hello, World!')).toBe('Hello World')
      expect(removeSpecialChars('Test@123#')).toBe('Test123')
      expect(removeSpecialChars('Normal text')).toBe('Normal text')
    })
  })

  describe('local storage utilities', () => {
    beforeEach(() => {
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
    })

    it('should get item from localStorage', () => {
      const getStorageItem = (key: string): string | null => {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      }

      vi.mocked(localStorage.getItem).mockReturnValue('test-value')
      expect(getStorageItem('test-key')).toBe('test-value')
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should set item in localStorage', () => {
      const setStorageItem = (key: string, value: string): void => {
        try {
          localStorage.setItem(key, value)
        } catch {
          // Silently fail if localStorage is not available
        }
      }

      setStorageItem('test-key', 'test-value')
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value')
    })

    it('should remove item from localStorage', () => {
      const removeStorageItem = (key: string): void => {
        try {
          localStorage.removeItem(key)
        } catch {
          // Silently fail if localStorage is not available
        }
      }

      removeStorageItem('test-key')
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('should handle JSON storage', () => {
      const setJSONItem = (key: string, value: any): void => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
          // Silently fail
        }
      }

      const getJSONItem = (key: string): any => {
        try {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : null
        } catch {
          return null
        }
      }

      const testObject = { id: 1, name: 'Test' }
      
      setJSONItem('test-object', testObject)
      expect(localStorage.setItem).toHaveBeenCalledWith('test-object', JSON.stringify(testObject))

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(testObject))
      const retrieved = getJSONItem('test-object')
      expect(retrieved).toEqual(testObject)
    })
  })

  describe('debounce utility', () => {
    it('should debounce function calls', () => {
      vi.useFakeTimers()
      
      const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: any[]) => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => func.apply(null, args), delay)
        }
      }

      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      // Call multiple times rapidly
      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled()

      // Fast forward time
      vi.advanceTimersByTime(100)

      // Should have been called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')

      vi.useRealTimers()
    })
  })

  describe('deep clone utility', () => {
    it('should create deep copy of objects', () => {
      const deepClone = <T>(obj: T): T => {
        if (obj === null || typeof obj !== 'object') return obj
        if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
        if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T
        
        const cloned = {} as T
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key])
          }
        }
        return cloned
      }

      const original = {
        id: 1,
        name: 'Test',
        nested: { value: 'nested' },
        array: [1, 2, { prop: 'value' }]
      }

      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.nested).not.toBe(original.nested)
      expect(cloned.array).not.toBe(original.array)
      expect(cloned.array[2]).not.toBe(original.array[2])
    })
  })
})
