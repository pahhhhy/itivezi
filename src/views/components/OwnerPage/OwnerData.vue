<script setup lang="ts">
import {useRoadStationStore} from "../../../stores/roadStation"
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import {ref} from 'vue'

const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const selectedRoadStation = ref<string>(roadStationUnitTempList.value[0])
const userAllData = ref<any>([])
const orderAllData = ref<any>([])
const totalUser = ref<number>(0)
const totalFarmer = ref<number>(0)
const totalMoney = ref<number>(0)
const totalOrderNum = ref<number>(0)
const totalOrderHuman = ref<number>(0)

function readUserAllData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testUser/')
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}

function readOrderAllData(roadStation: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testOrders/' + roadStation + "/")
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}

function getOrderNum(data: any) {
  let uidKey = Object.keys(data)
  let result: number = 0
  for (let i: number = 0; i < uidKey.length; i++) {
    let dayKey = Object.keys(data[uidKey[i]])
    for (let j: number = 0; j < dayKey.length; j++) {
      result = result + 1
    }
  }
  return result
}

async function initData() {
  let notFilterUserData: any = await readUserAllData()
  userAllData.value = Object.fromEntries(
      Object.entries(notFilterUserData).filter(([key, value]) => (value as any).affiliation.includes(selectedRoadStation.value))
  );
  orderAllData.value = await readOrderAllData(selectedRoadStation.value)
  let userUniqueKey = Object.keys(userAllData.value)
  totalUser.value = userUniqueKey.length
  totalOrderNum.value = getOrderNum(orderAllData.value)
  totalFarmer.value = Object.values(userAllData.value).filter(item => (item as any).role === "農家").length;
  totalMoney.value = getTotalMoney(orderAllData.value)
  totalOrderHuman.value = getOrderHumanNum(orderAllData.value).length
}

initData()

//取引完了のものの総額を計算する
function getTotalMoney(data: any) {
  let totalCompletedMoney = 0;

  for (const orderId in data) {
    const orderDetails = data[orderId];
    for (const orderDate in orderDetails) {
      const order = orderDetails[orderDate];
      if (order.state === "取引完了") {
        totalCompletedMoney += order.totalMoney;
      }
    }
  }
  return totalCompletedMoney
}

function getOrderHumanNum(data: any) {
  const orderNames = new Set();

  for (const orderId in data) {
    const orderDetails = data[orderId];
    for (const orderDate in orderDetails) {
      const order = orderDetails[orderDate];
      orderNames.add(order.orderName);
    }
  }

  const uniqueOrderNames = Array.from(orderNames);
  return uniqueOrderNames
}
</script>
<template>
  <h1>各種データ</h1>
  <select class="form-select" aria-label="roadsideStationSelect" v-model="selectedRoadStation" @change="initData">
    <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation>
      {{ roadStation }}
    </option>
  </select>
  <!-- {{ orderAllData }} -->
  <!-- <p>{{userAllData}}</p> -->
  <h2>利用数：{{ totalUser }}</h2>
  <h2>注文数:{{ totalOrderNum }}</h2>
  <h2>農家数:{{ totalFarmer }}</h2>
  <h2>合計金額:{{ totalMoney }}円</h2>
  <h2>購入者数:{{ totalOrderHuman }}</h2>
</template>
<style></style>