<script setup lang="ts">
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { ref,  onMounted ,computed} from 'vue'
import { getDatabase, ref as fireRef,  onValue } from 'firebase/database'
import {getCurrentRole} from "../utils/auth"
import OwnerBuyerList from './components/OwnerPage/OwnerBuyerList.vue'
import OwnerData from './components/OwnerPage/OwnerData.vue'
import OwnerFarmerList from './components/OwnerPage/OwnerFarmerList.vue'
import OwnerVegeList from './components/OwnerPage/OwnerVegeList.vue'
import OwnerOrderList from './components/OwnerPage/OwnerOrderList.vue'
//読みこむデータの指定
function readData(path:string,element: string) {
  const CountRef = fireRef(getDatabase(), path+'/' + element)
  const Data = ref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}

const myRole = ref<string | null>(null)
const vegeAllOrder=ref<any>(readData("testOrders",""))
onMounted(async () => {
  myRole.value = await getCurrentRole(getAuth())
})
const navBarNumber=ref<number>(0)
function changeNavBarNumber(number:number){
  navBarNumber.value=number
  console.log(navBarNumber.value)
}
</script>

<template>
  <h1>管理者画面</h1>
  
  <!-- 全員の注文履歴をみる
  現在の注文可能なリストをみる
  出品者のリストをみる
  購入者のリストをみる
  各データをみる（総利用者、注文数、生産者数、掲示板利用数、総購入金額、購入者数） -->
  
    <section v-if="myRole == '管理者'">
    <div class="nav-bar">
    <button v-on:click="changeNavBarNumber(1)">野菜リスト</button>
    <button v-on:click="changeNavBarNumber(2)">注文リスト</button>
    <button v-on:click="changeNavBarNumber(3)">利用者リスト</button>
    <button v-on:click="changeNavBarNumber(4)">各データ</button>
  </div>
  <OwnerVegeList  v-if="navBarNumber==1"></OwnerVegeList>
  <OwnerOrderList v-if="navBarNumber==2&&vegeAllOrder!=null" v-bind:vege-all-order="vegeAllOrder"></OwnerOrderList>
  <OwnerFarmerList v-if="navBarNumber==3"></OwnerFarmerList>
  <OwnerBuyerList v-if="navBarNumber==3"></OwnerBuyerList>
  <OwnerData v-if="navBarNumber==4"></OwnerData>
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
