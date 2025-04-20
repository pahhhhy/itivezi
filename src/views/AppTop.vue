<script setup lang="ts">
import {ref,watch,onMounted} from 'vue'
import {RouterLink} from 'vue-router'
import AppTopOwner from './components/AppTop/AppTopOwner.vue';
import { useUserStore } from '@/stores/userData';
import { usefireUserStore } from '@/stores/fireUserdata';
import { useVegeStore } from '@/stores/vege';
import { useCartStore } from '@/stores/cart';
import { useFireOrderStore } from '@/stores/fireOrder';
import { useSortVegeStore } from '@/stores/sortByVege';
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const loadtime=ref<boolean>(true)
const vegeStore=useVegeStore()
const sortVegeStore=useSortVegeStore()
const FireOrderStore=useFireOrderStore()
const fireUseStore=usefireUserStore()
const CartStore=useCartStore()
enum SortMode{
    All="all",
    Kawasaki="川崎",
    Murone="室根",
    Other="その他"
}
async function initData(){
  await userStore.roadUserData()
  await vegeStore.roadData()
  await FireOrderStore.roadData()
  await sortVegeStore.roadData(SortMode.All)
  CartStore.roadData()
  currentUser.value=userStore.currentUser
  if(currentUser.value){
    await fireUseStore.roadFireUseData(currentUser.value.uid)
  }
  else{
    console.log("error")
  }
  
}
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
onMounted(() => {
  
  setTimeout(async () => {
    if(currentUser.value){
      await initData()
    }
    loadtime.value=false;
  }, 1000);
});
</script>

<template>
  <article class="road" v-if="loadtime">
    <div class="three-quarter-spinner"></div>
  </article >
  <article v-if="currentUser == null&&!loadtime">

    <div class="login-form">
      <h3>ログインすることでこのアプリを使うことができます。</h3>

      <button class="btn btn-success p-2 m-3">
        <RouterLink v-bind:to="{ name: 'login' }">新規登録/ログイン</RouterLink>
      </button>
    </div>
  </article>
  <article v-if="currentUser != null&&!loadtime">
    <h1>ログインしました</h1>
    <AppTopOwner ></AppTopOwner>
  </article>
</template>
<style>
@keyframes spin {
  from {
    transform: rotate(0);
  }
  to{
    transform: rotate(359deg);
  }
}
.three-quarter-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--main-color);
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin .5s linear 0s infinite;
}
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
