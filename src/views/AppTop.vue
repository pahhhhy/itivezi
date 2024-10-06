<script setup lang="ts">
import {ref,watch} from 'vue'
import {RouterLink} from 'vue-router'
import AppTopBuyer from './components/AppTop/AppTopBuyer.vue';
import AppTopFarmer from './components/AppTop/AppTopFarmer.vue';
import AppTopOwner from './components/AppTop/AppTopOwner.vue';
import { useUserStore } from '@/stores/userData';
import { usefireUserStore } from '@/stores/fireUserdata';
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
const myUserData=ref<Usertables>(fireUseStore.myUserData)
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => fireUseStore.myUserData, (newUser) => {
  myUserData.value = newUser;
});
</script>

<template>
  <div class="title">
    <h1>TOP</h1>
  </div>
  
  <article v-if="currentUser == null">
    
    <div class="login-form">
      <h3>ログイン、会員登録することでこのアプリを使うことができます。</h3>
      <h2>ログインしてください。</h2>
      <p class="btn btn-success">
        <RouterLink v-bind:to="{ name: 'login' }">新規登録/ログイン</RouterLink>
      </p>
    </div>
    
    
  </article>
  <article v-if="currentUser != null">
    <h1>ようこそ{{ currentUser.displayName }}様</h1>
    <AppTopBuyer v-if="myUserData.role==Role.Buyer&&myUserData.gender!=''"></AppTopBuyer>
    <AppTopFarmer v-if="myUserData.role==Role.Farmer&&myUserData.gender!=''"></AppTopFarmer>
    <AppTopOwner v-if="(myUserData.role==Role.Onwer||myUserData.role==Role.Murone||myUserData.role==Role.Kawasaki)&&myUserData.gender!=''"></AppTopOwner> 
  </article>
</template>
<style>
.title {
  text-align: center;
}
.login-form a{
  color: white;
  text-decoration: none;
}
.login-form{
  display: flex;
  align-items: center;
  flex-direction:column;
}
</style>
