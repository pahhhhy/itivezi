import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../views/OrderPage.vue'
import AppTop from '../views/AppTop.vue'
import RegistrationPage from '../views/RegistrationPage.vue'
import MyPage from '../views/myPage.vue'
import Signup from '../views/signupPage.vue'
import Rogin from '../views/roginPage.vue'
import Addinfo from '../views/Add_Info.vue'
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
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/rogin',
      name: 'rogin',
      component: Rogin
    },
    {
      path: '/Add_Info',
      name: 'Add_Info',
      component: Addinfo
    }
  ]
})

export default router
