<script setup lang="ts">
//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref ,watch} from 'vue'
import {  type User } from 'firebase/auth'
import MyPageOrder from './components/mypage/MyPageOrder.vue'
import MyPageUpdate from './components/mypage/MyPageUpdate.vue'
import MyPageMyVege from './components/mypage/MyPageMyVege.vue'
import { useUserStore } from '@/stores/userData';
import { useVegeStore } from '@/stores/vege'
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [key:string]:{
        [key:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
    }
}
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const userStore=useUserStore()
const currentUser = ref<User|null>(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
});
</script>

<template>
  <div class="title">
    <h1>マイページ</h1>
  </div>

  <my-page-update v-bind:current-user="currentUser" v-bind:vege-all-data="vegeAllData" v-if="currentUser != null"></my-page-update>
  <my-page-my-vege
    v-bind:current-user="currentUser"
    v-if="currentUser != null "
  ></my-page-my-vege>
  <my-page-order v-bind:current-user="currentUser" v-if="currentUser != null"></my-page-order>
</template>
<style>
.title {
  text-align: center;
}
</style>
