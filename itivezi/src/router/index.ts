import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../views/orderPage.vue'
import AppTop from '../views/AppTop.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'AppTop',
      component: AppTop
    },
    {
      path: '/orderpage',
      name: 'orderpage',
      component: OrderPage
    }
  ]
})

export default router
