// router/index.ts
import { createRouter, createWebHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

routes.forEach(route => {
  if (route.path === '/login') {
    route.meta = { ...(route.meta || {}), layout: BlankLayout }
  } else if (!route.meta?.layout) {
    route.meta = { ...(route.meta || {}), layout: DefaultLayout }
  }
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
