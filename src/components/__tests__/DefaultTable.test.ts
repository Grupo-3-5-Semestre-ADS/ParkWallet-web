import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import DefaultTable from '@/components/DefaultTable.vue'

const vuetify = createVuetify()

// Mock vuetify components
vi.mock('vuetify/components', () => ({
  VRow: { template: '<div><slot /></div>' },
  VCol: { template: '<div><slot /></div>' },
  VTextField: { template: '<input />' },
  VBtn: { template: '<button><slot /></button>' },
  VDataTable: { template: '<div><slot /></div>' },
  VTooltip: { template: '<div><slot /></div>' },
  VIcon: { template: '<i></i>' }
}))

describe('DefaultTable', () => {
  let wrapper: any

  const defaultProps = {
    tableItems: [
      { id: 1, name: 'Item 1', status: 'active' },
      { id: 2, name: 'Item 2', status: 'inactive' }
    ],
    headers: [
      { title: 'ID', key: 'id' },
      { title: 'Name', key: 'name' },
      { title: 'Status', key: 'status' }
    ],
    loading: false,
    showSearch: true,
    showAddButton: true,
    showEditButton: true,
    showInactivateButton: true,
    searchPlaceholder: 'Search items',
    addButtonText: 'Add Item'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('rendering', () => {
    it('should render with default props', () => {
      wrapper = mount(DefaultTable, {
        props: defaultProps,
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should show search field when showSearch is true', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, showSearch: true },
        global: {
          plugins: [vuetify]
        }
      })

      const searchField = wrapper.find('input')
      expect(searchField.exists()).toBe(true)
    })

    it('should hide search field when showSearch is false', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, showSearch: false },
        global: {
          plugins: [vuetify]
        }
      })

      const searchField = wrapper.find('input')
      expect(searchField.exists()).toBe(false)
    })

    it('should show add button when showAddButton is true', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, showAddButton: true },
        global: {
          plugins: [vuetify]
        }
      })

      const addButton = wrapper.find('button')
      expect(addButton.exists()).toBe(true)
      expect(addButton.text()).toContain('Add Item')
    })

    it('should hide add button when showAddButton is false', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, showAddButton: false },
        global: {
          plugins: [vuetify]
        }
      })

      // Should not contain the add button
      const buttons = wrapper.findAll('button')
      const addButton = buttons.find(button => button.text().includes('Add Item'))
      expect(addButton).toBeUndefined()
    })
  })

  describe('events', () => {
    it('should emit add event when add button is clicked', async () => {
      wrapper = mount(DefaultTable, {
        props: defaultProps,
        global: {
          plugins: [vuetify]
        }
      })

      const addButton = wrapper.find('button')
      await addButton.trigger('click')

      expect(wrapper.emitted('add')).toBeTruthy()
      expect(wrapper.emitted('add')).toHaveLength(1)
    })

    it('should emit search-updated event when search input changes', async () => {
      vi.useFakeTimers()
      
      wrapper = mount(DefaultTable, {
        props: defaultProps,
        global: {
          plugins: [vuetify]
        }
      })

      // Simulate search input
      wrapper.vm.onSearchInput('test search')
      
      // Advance timer to trigger debounced event
      vi.advanceTimersByTime(500)

      expect(wrapper.emitted('search-updated')).toBeTruthy()
      expect(wrapper.emitted('search-updated')[0]).toEqual(['test search'])
      
      vi.useRealTimers()
    })

    it('should debounce search input', async () => {
      vi.useFakeTimers()
      
      wrapper = mount(DefaultTable, {
        props: defaultProps,
        global: {
          plugins: [vuetify]
        }
      })

      // Simulate rapid search inputs
      wrapper.vm.onSearchInput('a')
      wrapper.vm.onSearchInput('ab')
      wrapper.vm.onSearchInput('abc')

      // Should not emit immediately
      expect(wrapper.emitted('search-updated')).toBeFalsy()

      // Fast forward time to trigger debounce
      vi.advanceTimersByTime(500)

      expect(wrapper.emitted('search-updated')).toBeTruthy()
      expect(wrapper.emitted('search-updated')).toHaveLength(1)
      expect(wrapper.emitted('search-updated')[0]).toEqual(['abc'])

      vi.useRealTimers()
    })
  })

  describe('props validation', () => {
    it('should handle empty tableItems array', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, tableItems: [] },
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle undefined tableItems', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, tableItems: undefined },
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle empty headers array', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, headers: [] },
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle undefined headers', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, headers: undefined },
        global: {
          plugins: [vuetify]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('utility functions', () => {
    beforeEach(() => {
      wrapper = mount(DefaultTable, {
        props: defaultProps,
        global: {
          plugins: [vuetify]
        }
      })
    })

    describe('formatCpf', () => {
      it('should format valid CPF correctly', () => {
        expect(wrapper.vm.formatCpf('12345678901')).toBe('123.456.789-01')
        expect(wrapper.vm.formatCpf('98765432100')).toBe('987.654.321-00')
      })

      it('should handle empty or null values', () => {
        expect(wrapper.vm.formatCpf('')).toBe('CPF não informado')
        expect(wrapper.vm.formatCpf(null)).toBe('CPF não informado')
        expect(wrapper.vm.formatCpf(undefined)).toBe('CPF não informado')
      })

      it('should handle invalid CPF length', () => {
        expect(wrapper.vm.formatCpf('123')).toBe('CPF inválido')
        expect(wrapper.vm.formatCpf('123456789012')).toBe('CPF inválido')
        expect(wrapper.vm.formatCpf('123456789')).toBe('CPF inválido')
      })

      it('should handle CPF with special characters', () => {
        expect(wrapper.vm.formatCpf('123.456.789-01')).toBe('CPF inválido')
        expect(wrapper.vm.formatCpf('123456789-01')).toBe('CPF inválido')
      })
    })

    describe('getTypeName', () => {
      it('should return correct type names', () => {
        expect(wrapper.vm.getTypeName('store')).toBe('Loja')
        expect(wrapper.vm.getTypeName('attraction')).toBe('Atração')
        expect(wrapper.vm.getTypeName('other')).toBe('Outro')
      })

      it('should handle unknown types', () => {
        expect(wrapper.vm.getTypeName('unknown')).toBeUndefined()
        expect(wrapper.vm.getTypeName('')).toBeUndefined()
        expect(wrapper.vm.getTypeName(null)).toBeUndefined()
      })

      it('should handle case sensitivity', () => {
        expect(wrapper.vm.getTypeName('STORE')).toBeUndefined()
        expect(wrapper.vm.getTypeName('Store')).toBeUndefined()
      })
    })

    describe('getStatusName', () => {
      it('should return correct status names', () => {
        expect(wrapper.vm.getStatusName('pending')).toBe('Pendente')
        expect(wrapper.vm.getStatusName('completed')).toBe('Concluído')
        expect(wrapper.vm.getStatusName('failed')).toBe('Falhou')
      })

      it('should handle unknown statuses', () => {
        expect(wrapper.vm.getStatusName('unknown')).toBeUndefined()
        expect(wrapper.vm.getStatusName('')).toBeUndefined()
        expect(wrapper.vm.getStatusName(null)).toBeUndefined()
      })

      it('should handle case sensitivity', () => {
        expect(wrapper.vm.getStatusName('PENDING')).toBeUndefined()
        expect(wrapper.vm.getStatusName('Pending')).toBeUndefined()
      })
    })

    describe('getRoleName', () => {
      it('should return correct role names', () => {
        expect(wrapper.vm.getRoleName('CUSTOMER')).toBe('Cliente')
        expect(wrapper.vm.getRoleName('ADMIN')).toBe('Administrador')
        expect(wrapper.vm.getRoleName('SELLER')).toBe('Vendedor')
      })

      it('should handle unknown roles', () => {
        expect(wrapper.vm.getRoleName('unknown')).toBeUndefined()
        expect(wrapper.vm.getRoleName('')).toBeUndefined()
        expect(wrapper.vm.getRoleName(null)).toBeUndefined()
      })

      it('should handle case sensitivity', () => {
        expect(wrapper.vm.getRoleName('customer')).toBeUndefined()
        expect(wrapper.vm.getRoleName('Customer')).toBeUndefined()
      })
    })

    describe('getStatusColor', () => {
      it('should return correct status colors', () => {
        expect(wrapper.vm.getStatusColor('pending')).toBe('blue')
        expect(wrapper.vm.getStatusColor('completed')).toBe('green')
        expect(wrapper.vm.getStatusColor('failed')).toBe('red')
      })

      it('should handle unknown statuses', () => {
        expect(wrapper.vm.getStatusColor('unknown')).toBeUndefined()
        expect(wrapper.vm.getStatusColor('')).toBeUndefined()
        expect(wrapper.vm.getStatusColor(null)).toBeUndefined()
      })

      it('should handle case sensitivity', () => {
        expect(wrapper.vm.getStatusColor('PENDING')).toBeUndefined()
        expect(wrapper.vm.getStatusColor('Pending')).toBeUndefined()
      })
    })
  })

  describe('intersection observer', () => {
    it('should emit load-more when intersecting and not loading', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, loading: false },
        global: {
          plugins: [vuetify]
        }
      })

      wrapper.vm.onIntersect(true)

      expect(wrapper.emitted('load-more')).toBeTruthy()
      expect(wrapper.emitted('load-more')).toHaveLength(1)
    })

    it('should not emit load-more when intersecting but loading', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, loading: true },
        global: {
          plugins: [vuetify]
        }
      })

      wrapper.vm.onIntersect(true)

      expect(wrapper.emitted('load-more')).toBeFalsy()
    })

    it('should not emit load-more when not intersecting', () => {
      wrapper = mount(DefaultTable, {
        props: { ...defaultProps, loading: false },
        global: {
          plugins: [vuetify]
        }
      })

      wrapper.vm.onIntersect(false)

      expect(wrapper.emitted('load-more')).toBeFalsy()
    })
  })

  describe('search debouncing', () => {
    it('should clear previous timer when new search input', () => {
      vi.useFakeTimers()
      
      wrapper = mount(DefaultTable, {
        props: defaultProps,
        global: {
          plugins: [vuetify]
        }
      })

      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
      
      wrapper.vm.onSearchInput('first')
      wrapper.vm.onSearchInput('second')

      expect(clearTimeoutSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should handle null search input', () => {
      vi.useFakeTimers()
      
      wrapper = mount(DefaultTable, {
        props: defaultProps,
        global: {
          plugins: [vuetify]
        }
      })

      wrapper.vm.onSearchInput(null)
      
      vi.advanceTimersByTime(500)

      expect(wrapper.emitted('search-updated')).toBeTruthy()
      expect(wrapper.emitted('search-updated')[0]).toEqual([''])

      vi.useRealTimers()
    })
  })
})
