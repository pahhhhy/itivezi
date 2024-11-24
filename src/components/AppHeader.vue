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
  logout="Logout",
  chat="Chat",
  announcements="Announcements"
}

const userStore=useUserStore()
const fireUseStore=usefireUserStore()
const iconStore = (useIconStore())
const iconURL=ref<string|null|undefined>(iconStore.iconURL)
const myRole = ref<string>("")
const sidebar=ref(null)
const myUserData=ref<Usertables>(fireUseStore.myUserData)
const currentUser = ref(userStore.currentUser);
const cartStore=useCartStore()
const cartData=ref<CartTables>(cartStore.cartData)
const cartCount=ref<number>(0)
  const route = useRoute();
  const isBurger=ref<boolean>()
const blackback=ref(null)
if(currentUser.value)
cartCount.value=cartStore.getCountCart(currentUser.value.uid)
//バーガーの押したときにはアニメーションを走らせ、
//ついでにサイドバーのボタンを押したときに対応したページに飛ぶコードも一緒に書いた。
async function onClickBurger(mode:PageMode){
  switch (mode){
    case PageMode.home:
      await router.push("/")
      break;
      case PageMode.order:
      await router.push("/order")
      break;
      case PageMode.registration:
      await router.push("/registration")
      break;
      case PageMode.mypage:
      await router.push("/my-page")
      break;
      case PageMode.owner:
      await router.push("/Owner")
      break;
      case PageMode.login:
      await router.push("/login")
      break;
      case PageMode.chat:
      await router.push("/chat")
      break;
      case PageMode.announcements:
      await router.push("/announcements")
      break;
      case PageMode.logout:
      logout()
      break;
      default:
        break;
  }
  isBurger.value = !isBurger.value
}
const auth = getAuth()
async function logout() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      iconStore.deleteURL()
      router.push("/")
    })
}
//今なんのページにいるかを判定する。
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
      case PageMode.announcements:
      return route.path === '/announcements';
      case PageMode.chat:
      return route.path === '/chat';
    case PageMode.login:
      return route.path === '/login';
    default:
      return false;
  }
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
async function onPushComment(){
  await router.push('/chat')
}
async function onPushIcon(){
  await router.push('/')
}
async function onPushMypage(){
  await router.push('/my-page')
}
async function onPushCart(){
  await router.push('/cart')
}
</script>

<template>
  <div class="background"></div>
  <div class="blank"> </div>
  <div v-bind:class="{black_back:isBurger,active:isBurger}" class="blackback" ref="blackback" v-on:click="onClickBurger(PageMode.None)">
  </div>
  <header>
    <div class="header-icon" v-on:click="onPushIcon">
      <img src="..\\assets\\itivezilogo.png" alt="" />
    </div>
    
    <nav>
      <button v-on:click="onPushComment"><i class="bi bi-chat-right-text comment"  ></i></button>
        <div class="cart "  v-on:click="onPushCart" v-if="currentUser != null">
          <div class="cart_icon" v-if="cartCount==0">
            <img src="../assets/cart.png" alt="">
          </div>
          <div v-if="cartCount!=0" class="cart_icon">
            <img src="../assets/cart!.png" alt="">
          </div>
          <p class="d-none d-sm-block">買い物かご</p>
        </div>
        <div class="myacount" v-if="currentUser != null" v-on:click="onPushMypage">
          <div v-if="iconURL != null&&iconURL != '' "><img v-bind:src="iconURL" alt="" class="aicon-image"></div>
          <p v-if="currentUser != null" class="d-none d-sm-block">{{ currentUser.displayName }}様</p>
        </div>
      <i v-if="!isBurger" v-on:click="onClickBurger(PageMode.None)" class="bi bi-justify burger"></i>
      <i v-if="isBurger" v-on:click="onClickBurger(PageMode.None)" class="bi bi-x-lg burger"></i>
    </nav>
  </header>
  <aside  ref="sidebar" v-bind:class="{active:isBurger}">
    <ul>
      <li :class="{ 'active': isActive(PageMode.home) }">
        <div v-on:click="onClickBurger(PageMode.home)" class="sidebar_element" >
          <i class="bi bi-house"></i>
          <p>ホーム</p>
        </div>
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
      <li v-if="currentUser != null" :class="{ 'active': isActive(PageMode.chat) }">
        <button v-on:click="onClickBurger(PageMode.chat)" class="sidebar_element" >
          <i class="bi bi-chat-right-text"></i>
          <p>チャット</p>
        </button>
      </li>
      <li v-if="currentUser != null" :class="{ 'active': isActive(PageMode.announcements) }">
        <button v-on:click="onClickBurger(PageMode.announcements)" class="sidebar_element" >
          <i class="bi bi-clipboard2-minus"></i>
          <p>掲示板</p>
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
button{
  border: none;
  background-color: white
}
.blank{
  width: 100%;
  height: 60px;
}
header {
  height: 60px;
  width: 100vw;
  display: flex;
  top:0;
  justify-content: space-between;
  position: fixed;
  border-bottom: 1px solid rgb(223, 223, 223);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.26);
  padding: 0 3%;
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: 20;
  background-color: white;
}
header i{
  color: var(--text-color);
}
.header-icon{
  width: 35%;
  height: 60px;
  display: flex;
  align-items: center;
}
.header-icon img{
  width: 100%;
  object-fit: contain;
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
.cart_icon img{
  width: 40px;
  height: 40px;
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
  width: 62%;
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 5px;
}
.comment{
  width: 35px;
  height: 40px;
  text-align: center;
  font-size: 35px;
  margin-right: 10px;
}
.aicon-image{
  width: 50px;
  height: 50px;
  border-radius: 25px;
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
  height: calc(100% - 60px);
  width: 200px;
  top: 60px;
  position: fixed;
  background-color: white;
  z-index: 20;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.25);
  transition: 0.5s all ease ;
}
aside.active{
  left: 0;
  transition: 0.5s all ease ;
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
.blackback{
  position: fixed;
  display: block;
  top: 60px;
  left: 0;
  background-color:rgba(3,3,3); ;
  opacity: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  transition: all 0.5s ease;
  pointer-events: none;
}

.blackback.active{
  top: 60px;
  left: 0;
  background-color:rgba(3,3,3); ;
  width: 100vw;
  height: 100vh;
  opacity: 0.5;
  z-index: 10;
  pointer-events: all;
  transition: all  0.5s ease;
}
.background{
  position: fixed;
  display: block;
  top: 60px;
  left: 0;
  background-color:var(--background-color) ;
  width: 100vw;
  height: 100vh;
  z-index: -3;
  transition: all 0.5s ease;
}

@media (max-width: 575.98px) {
  .cart_icon p{
    top: 21%;
    left: 57%;
  }
  .comment{
    margin-right: 0px;
  }
 }
</style>
