<script setup lang="ts">
import { getDatabase, ref as fireRef, onValue,  } from 'firebase/database'
import { ref, computed } from 'vue'
import { type User } from 'firebase/auth'
import {useRoadStationStore}from "../../../stores/roadStation"
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
interface Props {
  currentUser: User | null
}
const myOrderData = ref<any>(null)
const props = defineProps<Props>()
async function initData(){
  myOrderData.value= await readData()
  myOrderVegeData.value=updateKeysNum()
}
initData()
function readData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testOrders/' )
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}

//これがすべての注文データから野菜のデータだけ抜いたやつ。注文の時間で昇順に並べてある。
//指定するときはmyDataKeysNum[何番目の][何個目]でやる
const myOrderVegeData = ref<any>(null)
  function updateKeysNum() {
  let resultList: any = {}

  // 道の駅ごとに処理を行う
  for (let k = 0; k < roadStationUnitTempList.value.length; k++) {
    let station = roadStationUnitTempList.value[k]
    // 道の駅ごとのユーザーIDを取得
    let userIds = Object.keys(myOrderData.value[station])
    console.log(userIds)
    for (let i = 0; i < userIds.length; i++) {
      let uid = userIds[i]
      if (props.currentUser != null && uid != props.currentUser.uid) {
        continue // 現在のユーザーのデータ以外は無視
      }
      let orderTimes = Object.keys(myOrderData.value[station][uid])
      if (!resultList[station]) {
        resultList[station] = {} // ステーションのキーを初期化
      }
      resultList[station][uid] = {} // ユーザーIDごとのキーを初期化
      for (let j = 0; j < orderTimes.length; j++) {
        let time = orderTimes[j]
        resultList[station][uid][time] = {} // 時間ごとのキーを初期化
        for (let m = 0; m < 99999999; m++) {
          let vegeData = myOrderData.value[station][uid][time][m]
          if (vegeData === undefined) {
            console.log("該当の場所にdataがない")
            break
          }
          // 数字のキーのデータを追加
          resultList[station][uid][time][m] = vegeData
        }
      }
    }
  }

  return resultList
}

const isToggle = ref<boolean>(false)
function pushToggle() {
  isToggle.value = !isToggle.value;
  
}

</script>
<template>
  <!-- <h1>{{ nyOrderKeys }}</h1>-->
  <!-- <p>{{ myOrderData}}</p> -->
  <!-- {{myOrderVegeData}} -->
  <!-- <h3>{{ nyOrderKeysNum }}</h3> -->
  <!-- <h3>{{ OrderTimeList }}</h3> -->
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の注文</h2>
  </button>
  <article v-show="isToggle" v-if="props.currentUser!=null">
    <div>
      <div v-for="(item, roadStation) in myOrderVegeData" :key="roadStation" class="order-item">
        <h2>{{ roadStation }}</h2>
        <div  v-for="(element,date) in item[props.currentUser.uid]" :key="date" class="order-item">
          <h3>注文日：{{date }}</h3>
          <div v-for="data in element" :key="data">
            <h3>野菜名: {{ data .vegeName }}</h3>
            <p>生産者名: {{ data .farmerName }}</p>
            <p>単価: {{ data .unit }}</p>
            <p>個数: {{ data .amount }}</p>
            <p>金額: {{ data .price }}円</p>
          </div>
          <h3>希望日: {{ myOrderData[roadStation][props.currentUser.uid][date].selectDate }}</h3>
          <h3>合計金額: {{ myOrderData[roadStation][props.currentUser.uid][date].totalMoney }}円</h3>
        </div>
      </div>
    </div>
  </article>
</template>
<style>
.toggle-button {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}

.order-item {
  border: 1px solid gray;
}
</style>
