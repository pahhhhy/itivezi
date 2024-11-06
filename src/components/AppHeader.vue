<script setup lang="ts">
import { ref,watch } from 'vue'
import { RouterLink,useRoute } from 'vue-router'
import {
  getAuth,
  signOut,
} from 'firebase/auth'

import router from '@/router'
import {useIconStore}from "../stores/icon"
import gsap from 'gsap';
import { useUserStore } from '@/stores/userData';
import { usefireUserStore } from '@/stores/fireUserdata';
import { useCartStore } from '@/stores/cart';
interface CartTables{
    [uid:string]:{
         [uniqueKey: string]:CartElementTables;
        
    }
}
interface CartElementTables{
    en:number;
    farmer:string
    roadStation:string[]
    unit:string
    photo:string
    unique:string
    vegeName:string
    amount:number
}

interface Emits {
  (event: 'OnBurger', Next: boolean): void
}
interface Usertables{
    affiliation:String[]
    gender:string
    name:string
    phoneNumber:number
    place:string
    role:Role
    email:string
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
  }
enum PageMode{
  home="Home",
  order="Order",
  registration="Registation",
  mypage="Mypage",
  owner="Onwer",
  None="null",
  login="login",
  logout="Logout"
}

const userStore=useUserStore()
const fireUseStore=usefireUserStore()
const emit = defineEmits<Emits>()
const iconStore = (useIconStore())
const iconURL=ref<string|null|undefined>(iconStore.iconURL)
const myRole = ref<string>("")
const isBurger = ref(false)
const sidebar=ref(null)
const myUserData=ref<Usertables>(fireUseStore.myUserData)
const currentUser = ref(userStore.currentUser);
const cartStore=useCartStore()
const cartData=ref<CartTables>(cartStore.cartData)
const cartCount=ref<number>(0)
  const route = useRoute();
if(currentUser.value)
cartCount.value=cartStore.getCountCart(currentUser.value.uid)
function onClickBurger(mode:PageMode){
  if(!isBurger.value){
    gsap.to(sidebar.value,{x:205,duration:0.5})
  }else{
    gsap.to(sidebar.value,{x:-205,duration:0.5})
  }
  switch (mode){
    case PageMode.home:
      router.push("/")
      break;
      case PageMode.order:
      router.push("/order")
      break;
      case PageMode.registration:
      router.push("/registration")
      break;
      case PageMode.mypage:
      router.push("/my-page")
      break;
      case PageMode.owner:
      router.push("/Owner")
      break;
      case PageMode.login:
      router.push("/login")
      break;
      case PageMode.logout:
      logout()
      break;
      default:
        break;
  }
  isBurger.value = !isBurger.value
  
  
  emit("OnBurger",isBurger.value)
}
const auth = getAuth()
function logout() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      iconStore.deleteURL()
      router.push("/")
    })
}
function isActive(page: PageMode): boolean {
  switch (page) {
    case PageMode.home:
      return route.path === '/';
    case PageMode.order:
      return route.path === '/order';
    case PageMode.registration:
      return route.path === '/registration';
    case PageMode.mypage:
      return route.path === '/my-page';
    case PageMode.owner:
      return route.path === '/Owner';
    case PageMode.login:
      return route.path === '/login';
    default:
      return false;
  }
}
function onPushCart(){
  router.push("/cart")
}
function onPuskMyPage(){
  router.push("/my-page")
}
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
  if(currentUser.value)
  iconStore.initURL(currentUser.value)
});
watch(() => fireUseStore.myUserData, (newUser) => {
  myUserData.value = newUser;
  myRole.value=myUserData.value.role
});
watch(() => cartStore.cartData, (newUser) => {
  cartData.value = newUser;
  if(currentUser.value)
  cartCount.value=cartStore.getCountCart(currentUser.value.uid)
});
watch(
  () => iconStore.iconURL,
  (newPhotoURL, oldPhotoURL) => {
    if (newPhotoURL !== oldPhotoURL) {
      // 変数userProfileImageを更新
      iconURL.value=iconStore.iconURL
    }
  }
);
</script>

<template>
  <header>
    <div class="header-icon">
      <img src="..\\assets\\itivezilogo.png" alt="" />
    </div>
    
    <nav>
        <div class="cart "  v-on:click="onPushCart">
          <div class="cart_icon">
            <i class="bi bi-cart"></i>
            <p>{{cartCount}}</p>
          </div>
          <p class="d-none d-sm-block">買い物かご</p>
        </div>
        <div class="myacount" v-on:click="onPuskMyPage">
          <div v-if="iconURL != null&&iconURL != '' "><img v-bind:src="iconURL" alt="" class="aicon-image"></div>
          <p v-if="currentUser != null" class="d-none d-sm-block">{{ currentUser.displayName }}様</p>
        </div>
      <i v-if="!isBurger" v-on:click="onClickBurger(PageMode.None)" class="bi bi-justify burger"></i>
      <i v-if="isBurger" v-on:click="onClickBurger(PageMode.None)" class="bi bi-x-lg burger"></i>
    </nav>
  </header>
  <aside  ref="sidebar">
    <ul>
      <li :class="{ 'active': isActive(PageMode.home) }">
        <button v-on:click="onClickBurger(PageMode.home)" class="sidebar_element" >
          <i class="bi bi-house"></i>
          <p>ホーム</p>
        </button>
      </li>

      <li v-if="currentUser != null" :class="{ 'active': isActive(PageMode.order) }">
        <button v-on:click="onClickBurger(PageMode.order)" class="sidebar_element" >
          <i class="bi bi-cart"></i>
          <p>注文</p>
        </button>
      </li>
      <li v-if="currentUser != null&& myRole != Role.Buyer" :class="{ 'active': isActive(PageMode.registration) }">
        <button v-on:click="onClickBurger(PageMode.registration)" class="sidebar_element" >
          <i class="bi bi-pencil-square"></i>
          <p>登録</p>
        </button>
      </li>
      <li v-if="currentUser != null" :class="{ 'active': isActive(PageMode.mypage) }">
        <button v-on:click="onClickBurger(PageMode.mypage)" class="sidebar_element" >
          <i class="bi bi-person"></i>
          <p>マイページ</p>
        </button>
      </li>
      <li v-if="currentUser == null" :class="{ 'active': isActive(PageMode.login) }">
        <button v-on:click="onClickBurger(PageMode.login)" class="sidebar_element" >
          <i class="bi bi-box-arrow-in-right"></i>
          <p>ログイン<br>新規登録</p>
        </button>
      </li>
      <li v-if="currentUser != null && [Role.Kawasaki, Role.Murone, Role.Onwer].includes(myUserData.role)" :class="{ 'active': isActive(PageMode.owner) }">
        <button v-on:click="onClickBurger(PageMode.owner)" class="sidebar_element" >
          <i class="bi bi-columns-gap"></i>
          <p>管理者画面</p>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger(PageMode.logout)" class="sidebar_element" style="display: flex">
          <i class="bi bi-box-arrow-in-left"></i>
          <p @click="logout" class="link">ログアウト</p>
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>

body {
  position: relative;
}
ul{
  padding: 0;
}
p{
  margin: 0;
}
header {
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgb(223, 223, 223);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.26);
  padding: 0 3%;
  overflow-x: hidden;
  overflow-y: hidden;
}
.header-icon{
  width: 50%;
}
.myacount{
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
}

.cart{
  display: flex;
  position: relative;
  flex-direction: column;
}
.cart_icon i{
  text-align: center;
  font-size: 40px;
  margin: 20%;
}
.cart_icon p{
  position: absolute;
  top: 17%;
  left: 42%;
    font-size: 21px;
  color: var(--main-color);
  margin: 0;
}
nav {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 5px;
}
.aicon-image{
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin: 0 10px;
}
nav >p{
  margin: 0 10px;
  font-size: large;
  font-weight:normal ;
  color:var(--text-color);
}
.burger {
  font-size: 50px;
  color: var(--main-color);
}
aside {
  left: -205px;
  height: calc(100% - 80px);
  width: 200px;
  position: absolute;
  background-color: white;
  z-index: 1;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.25);
}
aside i {
  font-size: 30px;
  margin: 0 10px ;
  color: var(--text-color);
}

aside li {
  list-style: none;
  padding: 10px 5px 10px 10px;
  border-top: 1px solid rgba(128, 128, 128, 0.24);
  border-bottom: 1px solid rgba(128, 128, 128, 0.24);
  
}
.link {
  text-decoration: none;
  font-size: 24px;
  padding: 0;
  color: var(--other-color);
}
.sidebar_element {
  border: none;
  background-color: white;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
}
li.active{
  background-color: #F5F5F5;
}
li.active .sidebar_element{
  background-color: #F5F5F5;
}
.sidebar_element p{
  margin-bottom: 10px;
  font-size: 24px;
  color: var(--other-color);
}
@media (max-width: 575.98px) { 
  .cart_icon p{
    top: 21%;
    left: 57%;
  }
 }
</style>
