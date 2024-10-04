<script setup lang="ts">
import { ref,watch } from 'vue'
import { RouterLink } from 'vue-router'
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
    roadStation:string
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
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
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
if(currentUser.value)
cartCount.value=cartStore.getCountCart(currentUser.value.uid)
const onClickBurger = (): void => {
  if(!isBurger.value){
    gsap.to(sidebar.value,{x:205,duration:0.5})
  }else{
    gsap.to(sidebar.value,{x:-205,duration:0.5})
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
function onPushCart(){
  router.push("/cart")
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
      <button v-if="cartCount!==0" v-on:click="onPushCart">カート:{{cartCount}}</button>
      <div v-if="iconURL != null&&iconURL != '' "><img v-bind:src="iconURL" alt="" class="aicon-image"></div>
      <p v-if="currentUser != null">{{ currentUser.displayName }}様</p>
      
      <i v-if="!isBurger" v-on:click="onClickBurger" class="bi bi-justify burger"></i>
      <i v-if="isBurger" v-on:click="onClickBurger" class="bi bi-x-lg burger"></i>
    </nav>
  </header>
  <aside  ref="sidebar">
    <ul>
      <li>
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-house"></i>
          <RouterLink v-bind:to="{ name: 'top' }" class="link">ホーム</RouterLink>
        </button>
      </li>

      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-cart"></i>
          <RouterLink v-bind:to="{ name: 'order' }" class="link">注文</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null&& myRole != Role.Buyer">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-pencil-square"></i>
          <RouterLink v-bind:to="{ name: 'registration' }" class="link">登録</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-person"></i>
          <RouterLink v-bind:to="{ name: 'my-page' }" class="link">マイページ</RouterLink>
        </button>
      </li>
      <li v-if="currentUser == null">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-box-arrow-in-right"></i>
          <RouterLink v-bind:to="{ name: 'login' }" class="link">ログイン<br>新規登録</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null && [Role.Kawasaki, Role.Murone, Role.Onwer].includes(myUserData.role)">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-columns-gap"></i>
          <RouterLink v-bind:to="{ name: 'Owner' }" class="link">管理者画面</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger" class="sidebar_element" style="display: flex">
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
header {
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgb(223, 223, 223);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.26);
  padding: 0 3%;
  overflow-x: hidden;
}
.header-icon{
  width: 50%;
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
}
</style>
