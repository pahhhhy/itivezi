import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../views/orderPage.vue'
import AppTop from '../views/AppTop.vue'
import RegistrationPage from '../views/RegistrationPage.vue'
import MyPage from '../views/myPage.vue'
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
    },
    {
      path: '/Registration',
      name: 'Registration',
      component: RegistrationPage
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPage
    }
  ]
})

export default router
