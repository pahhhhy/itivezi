<script setup lang="ts">
import { ref,  onMounted } from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import {useRoadStationStore}from "../../../stores/roadStation"
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
     
    } else {
      currentUser.value = null
    }
  })
})
const currentUser = ref<User | null>(null)
const isActive=ref<boolean>(false)
const OrderAllData=ref<any>([])
const vegeAllData=ref<any>([])
const dayisTureList=ref<any>([])
function onPushHistory(){
    isActive.value=!isActive.value
}
function readOrderAllData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testOrders/')
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}
function readVegeAllData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testVege/')
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}
async function initData(){
  //全体を取って
  OrderAllData.value=await readOrderAllData()
  vegeAllData.value=await readVegeAllData()
  if(currentUser.value!=null){
      //自分のデータのみにして
    OrderAllData.value=extractOrdersByName(OrderAllData.value, currentUser.value.displayName)
  }
  //販売停止かどうかを判定する
  dayisTureList.value=compareData(OrderAllData.value,vegeAllData.value)
  //逆順にする
  OrderAllData.value=reversedOrderAllData(OrderAllData.value)
}
initData()
// 自分のオーダーデータから［道の駅,UID,Data］になるように抽出する関数
function extractOrdersByName(data: any, targetName: string|null): any {
  const result: any = {};

  for (const location in data) {
    result[location] = {};

    for (const id in data[location]) {
      const orders = data[location][id];

      for (const orderDate in orders) {
        const order = orders[orderDate];

        if (order.orderName === targetName) {
          result[location][id] = result[location][id] || {};
          result[location][id][orderDate] = order;
        }
      }
    }
  }

  return result;
}
function filterVegeData(Data: any) {
  return Object.values(Data).filter(
    (v): v is { vegeName: string; unit: string; amount: number; price: number; farmerName: string } =>
    typeof v === "object" && "vegeName" in (v as any)
  );
}
function compareData(orders: any, veges: any) {
  const results: any = {};

  // 道の駅（駅名）ごとにループ
  Object.keys(orders).forEach(station => {
    if (currentUser.value) {
      const stationOrders = orders[station][currentUser.value.uid];
      const stationVeges = veges[station] || {};

      // 日付ごとにループ
      const dateResults: any = {};
      Object.keys(stationOrders).forEach(date => {
        const orderItems = stationOrders[date];
        let isAllAvailable = true; // 初期値をTrueに設定
        
        // 数字の部分だけを抽出してループする
        const numericKeys = Object.keys(orderItems).filter(key => /^\d+$/.test(key));

        numericKeys.forEach(itemKey => {
          const item = orderItems[itemKey];
          // 野菜データの中で該当する野菜を検索
          const vegeCategory = stationVeges[item.vegeName];
          if (vegeCategory) {
            const vege = vegeCategory[item.unique];
            if (!vege || vege.state !== "Available") {
              isAllAvailable = false;
            }
          } else {
            isAllAvailable = false;
          }
        });
        
        // 日付ごとの結果を追加
        dateResults[date] = isAllAvailable ;
      });
      
      // 道の駅ごとの結果を追加
      results[station] = dateResults;
    }
  });
  
  return results;
}
function reversedOrderAllData(data: any) {
  const reversedData: any = {};

  Object.keys(data).forEach(station => {
    const stationData = data[station];
    const reversedStationData: any = {};

    Object.keys(stationData).forEach(uid => {
      const uidData = stationData[uid];
      const reversedUidData: any = {};

      Object.keys(uidData).reverse().forEach(date => {
        reversedUidData[date] = uidData[date];
      });

      reversedStationData[uid] = reversedUidData;
    });

    reversedData[station] = reversedStationData;
  });

  return reversedData;
}
</script>
<template>
  <!-- {{OrderAllData}} -->
   <!-- {{dayisTureList }} -->
<button v-on:click="onPushHistory" v-bind:class="{active:isActive}" class="history-button">過去の注文</button>
<article v-if="isActive">
  <table v-for="(roadStation,index) in roadStationUnitTempList" :key="index">
    <caption>{{roadStation}}の過去の注文データ</caption>
    <thead>
      <tr>
        <th scope="col">日付</th>
        <th scope="col" colspan="4">野菜データ</th>
        <th scope="col">合計金額</th>
        <th scope="col">再度注文</th>
      </tr>
    </thead>
    <tbody v-if="currentUser!=null">
      <tr v-for="(Data, day,Index) in OrderAllData[roadStation][currentUser.uid]" :key="Index">
        <!-- {{ Data }} -->
        <td>{{ day}}</td>
        <!-- 野菜データ部分のみをループ -->
        <td colspan="4">
          <table>
            <tr>
              <td>野菜</td>
              <td>単位</td>
              <td>個数</td>
              <td>値段</td>
              <td>農家名</td>
            </tr>
            <tr v-for="(vege, index) in filterVegeData(Data)" :key="index">
              <td>{{ vege.vegeName }}</td>
              <td>{{ vege.unit }}</td>
              <td>{{ vege.amount }}個</td>
              <td>{{ vege.price }}円</td>
              <td>{{ vege.farmerName }}</td>
            </tr>
          </table>
        </td>
        <!-- 合計金額は rowspanを使って結合 -->
        <td >{{ Data.totalMoney }}円</td>
        <td>
          <button v-if="dayisTureList[roadStation][day]">再度注文</button>
          <h3 v-if="!dayisTureList[roadStation][day]">販売停止</h3>
        </td>
      </tr>
    </tbody>
  </table>
</article>
</template>
<style>
.history-button{
    background: white;
}
.history-button.active{
    background: rgb(189, 188, 188);
}
caption {
  caption-side: bottom;
  padding: 10px;
  font-weight: bold;
}

thead,
tfoot {
  background-color: rgb(228 240 245);
}

th,
td {
  border: 1px solid gray!important;
  padding: 8px 10px;
}

td:last-of-type {
  text-align: center;
}

tbody > tr:nth-of-type(even) {
  background-color: rgb(237 238 242);
}

tfoot th {
  text-align: right;
}

tfoot td {
  font-weight: bold;
}
</style>