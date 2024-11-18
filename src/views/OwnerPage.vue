<script setup lang="ts">
import { ref,  watch } from 'vue'
import OwnerOrderList from './components/OwnerPage/OwnerOrderList.vue'
import OwnerBuyerList from './components/OwnerPage/OwnerBuyerList.vue'
import OwnerData from './components/OwnerPage/OwnerData.vue'
import OwnerFarmerList from './components/OwnerPage/OwnerFarmerList.vue'
import OwnerVegeList from './components/OwnerPage/OwnerVegeList.vue'
import OwnerNewVegeAdd from './components/OwnerPage/OwnerNewVegeAdd.vue'
import OwnerUserList from './components/OwnerPage/OwnerUserList.vue'
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
  const fireUseStore=usefireUserStore()
const myUserData=ref<Usertables>(fireUseStore.myUserData)
watch(() => fireUseStore.myUserData, (newUser) => {
  myUserData.value = newUser;
});
const navBarNumber=ref<number>(0)
function changeNavBarNumber(number:number){
  navBarNumber.value=number
  
}
</script>

<template>
  <h1>管理者画面</h1>
  
  <!-- 全員の注文履歴をみる
  現在の注文可能なリストをみる
  出品者のリストをみる
  購入者のリストをみる
  各データをみる（総利用者、注文数、生産者数、掲示板利用数、総購入金額、購入者数） -->
  
    <section v-if="[Role.Kawasaki, Role.Murone, Role.Onwer].includes(myUserData.role)">
    <div class="nav-bar">
    <button v-on:click="changeNavBarNumber(1)">野菜リスト</button>
    <button v-on:click="changeNavBarNumber(2)">注文リスト</button>
    <button v-on:click="changeNavBarNumber(3)">利用者リスト</button>
    <button v-on:click="changeNavBarNumber(4)">出品者、購買者リスト</button>
    <button v-on:click="changeNavBarNumber(5)">新しい野菜の追加</button>
    <button v-on:click="changeNavBarNumber(6)">各データ</button>
  </div>
  <OwnerVegeList  v-if="navBarNumber==1"></OwnerVegeList>
  <OwnerOrderList v-if="navBarNumber==2" ></OwnerOrderList>
  <OwnerUserList v-if="navBarNumber==3"></OwnerUserList>
  <OwnerFarmerList v-if="navBarNumber==4"></OwnerFarmerList>
  <OwnerBuyerList v-if="navBarNumber==4"></OwnerBuyerList>
  <OwnerNewVegeAdd v-if="navBarNumber==5"></OwnerNewVegeAdd>
  <OwnerData v-if="navBarNumber==6"></OwnerData>
  </section>
  <section v-else>
    エラーが発生しました。管理者ではない人が閲覧しました。
  </section>
  
  
</template>

<style>
.nav-bar{
  width: 100%;
  display: flex
}
.nav-bar button{
  background-color: white;
  font-size: 1.2rem;
  padding: 10px;
  margin:10px
}
</style>
