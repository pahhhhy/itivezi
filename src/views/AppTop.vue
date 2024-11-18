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

  <article v-if="currentUser == null">

    <div class="login-form">
      <h3>ログインすることでこのアプリを使うことができます。</h3>

      <button class="btn btn-success p-2 m-3">
        <RouterLink v-bind:to="{ name: 'login' }">新規登録/ログイン</RouterLink>
      </button>
    </div>


  </article>
  <article v-if="currentUser != null">
    <AppTopBuyer v-if="myUserData.role==Role.Buyer&&myUserData.gender!=''"></AppTopBuyer>
    <AppTopFarmer v-if="myUserData.role==Role.Farmer&&myUserData.gender!=''"></AppTopFarmer>
    <AppTopOwner v-if="(myUserData.role==Role.Onwer||myUserData.role==Role.Murone||myUserData.role==Role.Kawasaki)&&myUserData.gender!=''"></AppTopOwner>
  </article>
</template>
<style>
.login-form h3{
  margin-top:24px ;
}
.login-form a{
  color: white;
  text-decoration: none;
}
.login-form{
  display: flex;
  align-items: center;
  flex-direction:column;
  margin: 0 20px;
}
.card_button{
  padding: 15px;
  width: 150px;
  margin-top: 30px;
  border-radius: 30px;
  background-color: var(--main-color);
  color: white;
  font-size: 18px;
  border: none;
}
</style>
