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
  
  <!-- 全員の注文履歴をみる
  現在の注文可能なリストをみる
  出品者のリストをみる
  購入者のリストをみる
  各データをみる（総利用者、注文数、生産者数、掲示板利用数、総購入金額、購入者数） -->
  
    <section v-if="[Role.Kawasaki, Role.Murone, Role.Onwer].includes(myUserData.role)">
      <div class="nav-bar">
        <button v-on:click="changeNavBarNumber(1)" v-bind:class="{active:navBarNumber==1}">野菜</button>
        <button v-on:click="changeNavBarNumber(2)" v-bind:class="{active:navBarNumber==2}">注文</button>
        <button v-on:click="changeNavBarNumber(3)" v-bind:class="{active:navBarNumber==3}">利用者</button>
        <button v-on:click="changeNavBarNumber(4)" v-bind:class="{active:navBarNumber==4}">出品者</button>
        <button v-on:click="changeNavBarNumber(5)" v-bind:class="{active:navBarNumber==5}">購買者</button>
        <button v-on:click="changeNavBarNumber(6)" v-bind:class="{active:navBarNumber==6}">野菜の追加</button>
        <button v-on:click="changeNavBarNumber(7)" v-bind:class="{active:navBarNumber==7}">各データ</button>
        <button style="pointer-events: none;"></button>
      </div>
  <OwnerVegeList  v-if="navBarNumber==1"></OwnerVegeList>
  <OwnerOrderList v-if="navBarNumber==2" ></OwnerOrderList>
  <OwnerUserList v-if="navBarNumber==3"></OwnerUserList>
  <OwnerFarmerList v-if="navBarNumber==4"></OwnerFarmerList>
  <OwnerBuyerList v-if="navBarNumber==5"></OwnerBuyerList>
  <OwnerNewVegeAdd v-if="navBarNumber==6"></OwnerNewVegeAdd>
  <OwnerData v-if="navBarNumber==7"></OwnerData>
  </section>
  <section v-else>
    エラーが発生しました。管理者ではない人が閲覧しました。
  </section>
  
  
</template>

<style>
.nav-bar{
  width: 100vw;
  display: grid;
  grid-template-rows: 50px 50px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
.nav-bar button{
  background-color: white;
  font-size: 14px;
  border-color: var(--line-color);
}
.nav-bar button.active{
  background-color: var(--background-color);
}
</style>
