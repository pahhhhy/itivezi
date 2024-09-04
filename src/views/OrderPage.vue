<script setup lang="ts">
import { getDatabase, ref as fireRef, onValue} from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref} from 'vue'

import OrderStep1 from './components/orderpage/OrderStep1.vue'
import OrderStep2 from './components/orderpage/OrderStep2.vue'
import OrderStep3 from './components/orderpage/OrderStep3.vue'
import OrderStep4 from './components/orderpage/OrderStep4.vue'
import OrderPopup from './components/orderpage/OrderPopup.vue'
import SelectRoadStation from './components/SelectRoadStation.vue'
//変数の定義
const vegeAllData = ref<any>(null)
const stepNum = ref<number>(0)
const selectVegeList = ref<number[]>([])
const selectMenList = ref<string[]>([])
const selectMenUniqueList = ref<string[]>([])
const selectDate = ref<Date | null>(null)
const vegeCountList = ref<number[]>([])
const totalMoneyList = ref<number[]>([])
const allTotalMoney = ref<number>(0)
const finishSend = ref<boolean>(false)
const roadStation = ref<string>("")
const vegeKeys = ref<any>(null)
//読みこむデータの指定
function readvegeAllData(roadStation: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testVege/' + roadStation + "/")
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}
function readvegeKeys(roadStation: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testVegeKeys/' + roadStation + "/")
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}
// stateが"Discontinued"のアイテムを排除する関数
// 全部、型をanyでやってるの悪そうな感じがする
const filterDiscontinuedItems = (data:any) => {
  const filteredData:any = {};
  
  for (const [category, items] of Object.entries(data)as [any, any]) {
    const filteredItems:any = {};
    
    for (const [id, item] of Object.entries(items as any)as [string, any]) {
      if (item.state !== "Discontinued") {
        filteredItems[id] = item;
      }
    }
    
    if (Object.keys(filteredItems).length > 0) {
      filteredData[category] = filteredItems;
    }
  }
  
  return filteredData;
};


//Stepの管理
function onStep(next: boolean) {
  
  if (next) {
    stepNum.value = stepNum.value + 1
  } else {
    stepNum.value = stepNum.value - 1
  }
}
//子要素からのデータの受け取り
function onSend(isSend: boolean) {
  finishSend.value = isSend
}
function changeVege(element: number[]) {
  selectVegeList.value = element
}
function changeMen(element: string[], unique: string[]) {
  selectMenList.value = element
  selectMenUniqueList.value = unique
}
function changeCount(count: number[], money: number) {
  vegeCountList.value = count
  allTotalMoney.value = money
}
function changeDate(date: Date | null) {
  selectDate.value = date
}
function resetData(){
  selectMenList.value = []
  selectMenUniqueList.value = []
  selectDate.value = null
  vegeCountList.value = []
  totalMoneyList.value = []
  allTotalMoney.value = 0
}
async function  updateRoadStation(element:string){
  roadStation.value=element
  vegeAllData.value=await readvegeAllData(element)
  vegeAllData.value=filterDiscontinuedItems(vegeAllData.value)
  vegeKeys.value= await readvegeKeys(element)
  // 変数の初期化
  selectVegeList.value = []
  resetData()
}
</script>

<template>
  <div class="title">
    <h1>注文画面</h1>
  </div>
  <!-- {{ vegeAllData }} -->
  <!-- {{ vegeKeys }} -->
  <SelectRoadStation
  v-bind:-road-station="roadStation"
  v-on:on-step="onStep"
  v-on:update-road-station="updateRoadStation"
  v-if="stepNum==0">
</SelectRoadStation>
  <OrderStep1
    v-bind:vege-keys="vegeKeys"
    v-bind:select-vege-list="selectVegeList"
    v-on:on-step="onStep"
    v-on:change-vege="changeVege"
    v-on:reset-data="resetData"
    v-if="stepNum == 1"
  ></OrderStep1>

  <!-- 生産者の設定 -->
  <h1 v-if="stepNum == 1">{{ selectMenUniqueList }}</h1>
  <h1 v-if="stepNum == 1&&(vegeAllData==undefined||vegeAllData==null)">データがない</h1>
  <OrderStep2
    v-bind:vege-all-data="vegeAllData"
    v-bind:select-vege="selectVegeList"
    v-bind:select-men="selectMenList"
    v-bind:vege-keys="vegeKeys"
    v-bind:select-men-unique-list="selectMenUniqueList"
    v-on:on-step="onStep"
    v-on:change-men="changeMen"
    v-if="stepNum == 2&&vegeAllData!=undefined"
  ></OrderStep2>
  <!-- 日付・個数の指定 -->
  <OrderStep3
    v-bind:select-date="selectDate"
    v-bind:vege-count="vegeCountList"
    v-bind:vege-all-data="vegeAllData"
    v-bind:vege-keys="vegeKeys"
    v-bind:select-men-unique-list="selectMenUniqueList"
    v-bind:select-vege="selectVegeList"
    v-bind:total-money="totalMoneyList"
    v-on:change-count="changeCount"
    v-on:on-step="onStep"
    v-on:change-date="changeDate"
    v-if="stepNum == 3"
  ></OrderStep3>

  <!-- 確認・送信画面 -->
  <OrderStep4
    v-bind:select-date="selectDate"
    v-bind:vege-count="vegeCountList"
    v-bind:vege-all-data="vegeAllData"
    v-bind:vegeKeys="vegeKeys"
    v-bind:select-men-unique-list="selectMenUniqueList"
    v-bind:select-men="selectMenList"
    v-bind:select-vege="selectVegeList"
    v-bind:total-money="totalMoneyList"
    v-bind:all-total-money="allTotalMoney"
    v-bind:road-station="roadStation"
    v-on:on-step="onStep"
    v-on:on-send="onSend"
    v-if="stepNum == 4"
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
.write-button {
  width: 200px;
  height: 100px;
  margin: auto;
}
</style>
