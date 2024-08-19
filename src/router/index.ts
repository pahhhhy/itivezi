import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../views/OrderPage.vue'
import AppTop from '../views/AppTop.vue'
import RegistrationPage from '../views/RegistrationPage.vue'
import MyPage from '../views/MyPage.vue'
import Signup from '../views/SignupPage.vue'
import Login from '../views/LoginPage.vue'
import Addinfo from '../views/AddInfo.vue'
import Owner from '../views/OwnerPage.vue'
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
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/Add_Info',
      name: 'Add_Info',
      component: Addinfo
    },
    {
      path: '/Owner',
      name: 'Owner',
      component: Owner
    }
  ]
})

export default router
