import { createRouter, createWebHistory } from 'vue-router'
import OrderPage from '../views/OrderPage.vue'
import AppTop from '../views/AppTop.vue'
import RegistrationPage from '../views/RegistrationPage.vue'
import MyPage from '../views/MyPage.vue'
import MyPageorder from '../views/components/mypage/myPageOrderDetail.vue'
import MyAllorderView from '@/views/components/mypage/MyAllorderView.vue'
import Signup from '../views/SignupPage.vue'
import Login from '../views/LoginPage.vue'
import Addinfo from '../views/AddInfo.vue'
import Owner from '../views/OwnerPage.vue'
import Cart from '../views/CartPage.vue'
import Chat from '../views/ChatPage.vue'
import Announcements from "@/views/AnnouncementsPage.vue";
import ResetPasswordPage from '@/views/ResetPasswordPage.vue'
import VerifiPage from '@/views/VerifiPage.vue'
import OwnerOrderCheck from '@/views/components/OwnerPage/OwnerOrderCheck.vue'
import {
  getAuth
} from 'firebase/auth'
import {getCurrentRole} from "../utils/auth"
enum Role{
  Onwer="管理者",
  Buyer="飲食店",
  Farmer="農家",
  Murone="室根",
  Kawasaki="川崎",
  None=""
}
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'top',
      component: AppTop
    },
    {
      path: '/order',
      name: 'order',
      component: OrderPage
    },
    {
      path: '/registration',
      name: 'registration',
      component: RegistrationPage
    },
    {
      path: '/my-page',
      name: 'my-page',
      component: MyPage
    },
    {
      path: '/my-allorder',
      name: 'my-allorder',
      component: MyAllorderView
    },
    {
      path: '/my-page/:unique',
      name: 'my-page-order',
      component:MyPageorder
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
      path: '/add-info',
      name: 'add-info',
      component: Addinfo
    },
    {
      path: '/Owner',
      name: 'Owner',
      component: Owner
    },{
      path: '/Owner-order',
      name: 'Owner-order',
      component: OwnerOrderCheck
    },
    {
      path: '/cart',
      name: 'cart',
      component: Cart
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat,
    },
    {
      path: '/chat/:roomId',
      name: 'chat-room',
      component: Chat,
    },
    {
      path: '/announce',
      redirect: '/announcements',
    },
    {
      path: '/announcement',
      redirect: '/announcements',
    },
    {
      path: '/announcements',
      name: 'announcements',
      component: Announcements,
    },
    {
      path: '/announcements/:announceId',
      name: 'announcement',
      component: Announcements,
    },
    {
      path: '/reset',
      name: 'reset',
      component: ResetPasswordPage,
    },
    {
      path: '/verifi',
      name: 'verifi',
      component: VerifiPage,
    },
  ]
})
// ここからガードの追加部分
router.beforeEach(async (to, from, next) => {
  if (to.name === Role.Onwer||to.name === Role.Kawasaki||to.name === Role.Murone) {
  // if (to.name === 'chat') {
      if( await getCurrentRole(getAuth()) ===  Role.Onwer||await getCurrentRole(getAuth()) ===  Role.Murone||await getCurrentRole(getAuth()) ===  Role.Kawasaki) next();
      // if( await getCurrentRole(getAuth()) === "管理者" ) next();
      else next({name: 'login'})
  }else{
      next()
  }
})
export default router
