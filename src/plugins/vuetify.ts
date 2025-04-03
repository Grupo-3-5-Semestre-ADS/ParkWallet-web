// plugins/vuetify.ts

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#14517e',
          secondary: '#3B7098',
          accent: '#C34744',
          error: '#C34744',
          info: '#2196F3',
          success: '#118418',
          warning: '#FFC107',
        },
      },
    },
  },
})
