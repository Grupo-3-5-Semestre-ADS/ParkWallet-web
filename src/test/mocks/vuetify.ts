import { vi } from 'vitest'

// Mock all common Vuetify components
export const vuetifyComponents = {
  // App structure
  VApp: { name: 'VApp', template: '<div class="v-app"><slot /></div>' },
  VMain: { name: 'VMain', template: '<main class="v-main"><slot /></main>' },
  VContainer: { name: 'VContainer', template: '<div class="v-container"><slot /></div>' },
  VRow: { name: 'VRow', template: '<div class="v-row"><slot /></div>' },
  VCol: { name: 'VCol', template: '<div class="v-col"><slot /></div>' },
  VSpacer: { name: 'VSpacer', template: '<div class="v-spacer"></div>' },

  // Navigation
  VAppBar: { name: 'VAppBar', template: '<header class="v-app-bar"><slot /></header>' },
  VToolbar: { name: 'VToolbar', template: '<div class="v-toolbar"><slot /></div>' },
  VToolbarTitle: { name: 'VToolbarTitle', template: '<div class="v-toolbar-title"><slot /></div>' },
  VNavigationDrawer: { 
    name: 'VNavigationDrawer',
    template: '<nav class="v-navigation-drawer"><slot /></nav>',
    props: ['modelValue', 'temporary', 'location']
  },

  // Cards
  VCard: { name: 'VCard', template: '<div class="v-card"><slot /></div>' },
  VCardTitle: { name: 'VCardTitle', template: '<div class="v-card-title"><slot /></div>' },
  VCardText: { name: 'VCardText', template: '<div class="v-card-text"><slot /></div>' },
  VCardActions: { name: 'VCardActions', template: '<div class="v-card-actions"><slot /></div>' },

  // Buttons
  VBtn: { 
    name: 'VBtn',
    template: '<button class="v-btn" :disabled="disabled" :loading="loading" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ['disabled', 'loading', 'color', 'variant', 'size', 'block', 'icon', 'type'],
    emits: ['click']
  },
  VIconBtn: { name: 'VIconBtn', template: '<button class="v-icon-btn"><slot /></button>' },

  // Forms
  VForm: { 
    name: 'VForm', 
    template: '<form class="v-form" @submit.prevent="$emit(\'submit\', $event)"><slot /></form>',
    emits: ['submit']
  },
  VTextField: {
    name: 'VTextField',
    template: `
      <div class="v-text-field">
        <input 
          :value="modelValue" 
          @input="$emit('update:modelValue', $event.target.value)"
          @blur="$emit('blur', $event)"
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
        />
      </div>
    `,
    props: ['modelValue', 'label', 'type', 'placeholder', 'disabled', 'required', 'errorMessages'],
    emits: ['update:modelValue', 'blur']
  },
  VSelect: {
    name: 'VSelect',
    template: `
      <div class="v-select">
        <select 
          :value="modelValue" 
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option v-for="item in items" :key="item.value" :value="item.value">{{ item.text }}</option>
        </select>
      </div>
    `,
    props: ['modelValue', 'items', 'label'],
    emits: ['update:modelValue']
  },

  // Data tables
  VDataTable: {
    name: 'VDataTable',
    template: `
      <div class="v-data-table">
        <table>
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.key">{{ header.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td v-for="header in headers" :key="header.key">
                <slot :name="\`item.\${header.key}\`" :item="item" :index="index">
                  {{ item[header.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
        <slot name="bottom" />
      </div>
    `,
    props: ['headers', 'items', 'loading', 'itemsPerPage', 'serverItemsLength'],
    slots: ['bottom', 'item.*']
  },

  // Lists
  VList: { name: 'VList', template: '<div class="v-list"><slot /></div>' },
  VListItem: { 
    name: 'VListItem', 
    template: '<div class="v-list-item" @click="$emit(\'click\', $event)"><slot /></div>',
    emits: ['click']
  },
  VListItemTitle: { name: 'VListItemTitle', template: '<div class="v-list-item-title"><slot /></div>' },

  // Progress
  VProgressCircular: { name: 'VProgressCircular', template: '<div class="v-progress-circular"></div>' },
  VProgressLinear: { name: 'VProgressLinear', template: '<div class="v-progress-linear"></div>' },

  // Dialogs
  VDialog: {
    name: 'VDialog',
    template: `
      <div v-if="modelValue" class="v-dialog">
        <div class="v-overlay-scrim" @click="$emit('update:modelValue', false)"></div>
        <div class="v-dialog-content">
          <slot />
        </div>
      </div>
    `,
    props: ['modelValue', 'maxWidth', 'persistent'],
    emits: ['update:modelValue']
  },

  // Other
  VImg: { name: 'VImg', template: '<img class="v-img" :src="src" :alt="alt" />', props: ['src', 'alt'] },
  VIcon: { name: 'VIcon', template: '<i class="v-icon"><slot /></i>' },
  VDivider: { name: 'VDivider', template: '<hr class="v-divider" />' },
  VChip: { name: 'VChip', template: '<div class="v-chip"><slot /></div>' },
  VAlert: { name: 'VAlert', template: '<div class="v-alert"><slot /></div>' },
}

// Export as a plugin for easier setup
export const setupVuetifyMocks = () => {
  Object.entries(vuetifyComponents).forEach(([name, component]) => {
    vi.doMock(`vuetify/components/${name}`, () => ({ default: component }))
  })
}
