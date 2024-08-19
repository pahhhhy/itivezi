<script setup lang="ts">
import { getDatabase, ref, onValue} from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as vueRef, computed } from 'vue'

import OrderStep1 from './components/orderpage/OrderStep1.vue'
import OrderStep2 from './components/orderpage/OrderStep2.vue'
import OrderStep3 from './components/orderpage/OrderStep3.vue'
import OrderStep4 from './components/orderpage/OrderStep4.vue'
import OrderPopup from './components/orderpage/OrderPopup.vue'
//変数の定義
const vegeAllData = vueRef<any>(readData(''))
const stepNum = vueRef<number>(0)
const selectVegeList = vueRef<number[]>([])
const selectMenList = vueRef<string[]>([])
const selectMenListNum = vueRef<number[]>([])
const selectDate = vueRef<Date | null>(null)
const vegeCountList = vueRef<number[]>([])
const totalMoneyList = vueRef<number[]>([])
const allTotalMoney = vueRef<number>(0)
const finishSend = vueRef<boolean>(false)
const vegeKeys = computed(() => {
  return vegeAllData.value ? Object.keys(vegeAllData.value) : []
})
//読みこむデータの指定
function readData(element: string) {
  const countRef = ref(getDatabase(), 'testVege/' + element)
  const data = vueRef<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}



//Stepの管理
function onStep(next: boolean) {
  
  if (next) {
    stepNum.value = stepNum.value + 1
  } else {
    stepNum.value = stepNum.value - 1
  }
}
function onSend(isSend: boolean) {
  finishSend.value = isSend
}
//子要素からのデータの受け取り
function changeVege(element: number[]) {
  selectVegeList.value = element
}
function changeMen(element: string[], num: number[]) {
  selectMenList.value = element
  selectMenListNum.value = num
}
function changeCount(count: number[], money: number) {
  vegeCountList.value = count
  allTotalMoney.value = money
}
function changeDate(date: Date | null) {
  selectDate.value = date
}
</script>

<template>
  <div class="title">
    <h1>注文画面</h1>
  </div>
  <OrderStep1
    v-bind:vege-keys="vegeKeys"
    v-bind:select-vege-list="selectVegeList"
    v-on:on-step="onStep"
    v-on:change-vege="changeVege"
    v-if="stepNum == 0"
  ></OrderStep1>

  <!-- 生産者の設定 -->
  <h1 v-if="stepNum == 1">{{ selectMenListNum }}</h1>
  <OrderStep2
    v-bind:vege-all-data="vegeAllData"
    v-bind:select-vege="selectVegeList"
    v-bind:select-men="selectMenList"
    v-bind:vege-keys="vegeKeys"
    v-bind:select-men-num="selectMenListNum"
    v-on:on-step="onStep"
    v-on:change-men="changeMen"
    v-if="stepNum == 1"
  ></OrderStep2>
  <!-- 日付・個数の指定 -->
  <h1 v-if="stepNum == 2">oya:{{ selectDate }}</h1>
  <OrderStep3
    v-bind:select-date="selectDate"
    v-bind:vege-count="vegeCountList"
    v-bind:vege-all-data="vegeAllData"
    v-bind:vege-keys="vegeKeys"
    v-bind:select-men-num="selectMenListNum"
    v-bind:select-vege="selectVegeList"
    v-bind:total-money="totalMoneyList"
    v-on:change-count="changeCount"
    v-on:on-step="onStep"
    v-on:change-date="changeDate"
    v-if="stepNum == 2"
  ></OrderStep3>

  <!-- 確認・送信画面 -->
  <OrderStep4
    v-bind:select-date="selectDate"
    v-bind:vege-count="vegeCountList"
    v-bind:vege-all-data="vegeAllData"
    v-bind:vegeKeys="vegeKeys"
    v-bind:select-men-num="selectMenListNum"
    v-bind:select-men="selectMenList"
    v-bind:select-vege="selectVegeList"
    v-bind:total-money="totalMoneyList"
    v-bind:all-total-money="allTotalMoney"
    v-on:on-step="onStep"
    v-on:on-send="onSend"
    v-if="stepNum == 3"
  ></OrderStep4>
  <OrderPopup v-if="finishSend"></OrderPopup>
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
