import {createRouter, createWebHistory} from 'vue-router'
import OrderPage from '../views/OrderPage.vue'
import AppTop from '../views/AppTop.vue'
import RegistrationPage from '../views/RegistrationPage.vue'
import MyPage from '../views/MyPage.vue'
import Signup from '../views/SignupPage.vue'
import Login from '../views/LoginPage.vue'
import Addinfo from '../views/AddInfo.vue'
import Owner from '../views/OwnerPage.vue'
import {getAuth} from 'firebase/auth'
import {getCurrentRole} from "../utils/auth"
import Chat from '../views/ChatPage.vue'

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
        },
        {
            path: '/chat',
            name: 'chat',
            component: Chat,
        }
    ]
})
// ここからガードの追加部分
router.beforeEach(async (to, from, next) => {
    if (to.name === 'Owner') {
        // if (to.name === 'chat') {
        if (await getCurrentRole(getAuth()) === "管理者") next();
        // if( await getCurrentRole(getAuth()) === "管理者" ) next();
        else next({name: 'login'})
    } else {
        next()
    }
})
export default router
