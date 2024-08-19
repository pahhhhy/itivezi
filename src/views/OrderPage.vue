<script setup lang="ts">
import { getDatabase, ref, onValue} from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed } from 'vue'

import OrderStep1 from './components/orderpage/OrderStep1.vue'
import OrderStep2 from './components/orderpage/OrderStep2.vue'
import OrderStep3 from './components/orderpage/OrderStep3.vue'
import OrderStep4 from './components/orderpage/OrderStep4.vue'
import OrderPopup from './components/orderpage/OrderPopup.vue'
//変数の定義
const VegeAllData = Vueref<any>(ReadData(''))
const Stepnum = Vueref<number>(0)
const SelectVegelist = Vueref<number[]>([])
const SelectMenlist = Vueref<string[]>([])
const SelectMenlistnum = Vueref<number[]>([])
const selectedDate = Vueref<Date | null>(null)
const vegeCountList = Vueref<number[]>([])
const TotalmoneyList = Vueref<number[]>([])
const AllTotalmoney = Vueref<number>(0)
const FinishSend = Vueref<boolean>(false)
const vegekeys = computed(() => {
  return VegeAllData.value ? Object.keys(VegeAllData.value) : []
})
//読みこむデータの指定
function ReadData(element: string) {
  const CountRef = ref(getDatabase(), 'testVege/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}



//Stepの管理
function OnStep(Next: boolean) {
  
  if (Next) {
    Stepnum.value = Stepnum.value + 1
  } else {
    Stepnum.value = Stepnum.value - 1
  }
}
function OnSend(Issend: boolean) {
  FinishSend.value = Issend
}
//子要素からのデータの受け取り
function changeVege(element: number[]) {
  SelectVegelist.value = element
}
function chagemen(element: string[], num: number[]) {
  SelectMenlist.value = element
  SelectMenlistnum.value = num
}
function changecount(count: number[], money: number) {
  vegeCountList.value = count
  AllTotalmoney.value = money
}
function chagedate(date: Date | null) {
  selectedDate.value = date
}
</script>

<template>
  <div class="title">
    <h1>注文画面</h1>
  </div>
  <OrderStep1
    v-bind:vegekeys="vegekeys"
    v-bind:SelectVegelist="SelectVegelist"
    v-on:OnStep="OnStep"
    v-on:changeVege="changeVege"
    v-if="Stepnum == 0"
  ></OrderStep1>

  <!-- 生産者の設定 -->
  <h1 v-if="Stepnum == 1">{{ SelectMenlistnum }}</h1>
  <OrderStep2
    v-bind:vegealldata="VegeAllData"
    v-bind:Selectvege="SelectVegelist"
    v-bind:-selectmen="SelectMenlist"
    v-bind:vegekeys="vegekeys"
    v-bind:-selectmennum="SelectMenlistnum"
    v-on:OnStep="OnStep"
    v-on:changemen="chagemen"
    v-if="Stepnum == 1"
  ></OrderStep2>
  <!-- 日付・個数の指定 -->
  <h1 v-if="Stepnum == 2">oya:{{ selectedDate }}</h1>
  <OrderStep3
    v-bind:-select-date="selectedDate"
    v-bind:vege-count="vegeCountList"
    v-bind:vegealldata="VegeAllData"
    v-bind:vegekeys="vegekeys"
    v-bind:-select-mennum="SelectMenlistnum"
    v-bind:-selectvege="SelectVegelist"
    v-bind:-totalmoney="TotalmoneyList"
    v-on:changecount="changecount"
    v-on:OnStep="OnStep"
    v-on:changedate="chagedate"
    v-if="Stepnum == 2"
  ></OrderStep3>

  <!-- 確認・送信画面 -->
  <OrderStep4
    v-bind:-select-date="selectedDate"
    v-bind:vege-count="vegeCountList"
    v-bind:vegealldata="VegeAllData"
    v-bind:vegekeys="vegekeys"
    v-bind:-select-mennum="SelectMenlistnum"
    v-bind:-select-men="SelectMenlist"
    v-bind:-selectvege="SelectVegelist"
    v-bind:-totalmoney="TotalmoneyList"
    v-bind:all-totalmoney="AllTotalmoney"
    v-on:-on-step="OnStep"
    v-on:-on-send="OnSend"
    v-if="Stepnum == 3"
  ></OrderStep4>
  <OrderPopup v-if="FinishSend"></OrderPopup>
</template>
<style>
.title {
  text-align: center;
}
.database {
  display: flex;
  align-items: center;
  justify-content: center;
}
.writebutton {
  width: 200px;
  height: 100px;
  margin: auto;
}
</style>
