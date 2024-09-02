<script setup lang="ts">
import { ref,onMounted} from 'vue'
import { getDatabase, ref as fireRef, update, onValue, set} from 'firebase/database'
import{ useRoadStationStore}from "../../../stores/roadStation"

const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const selectdRoadStation=ref<string>(roadStationUnitTempList.value[0])
const orderAllData=ref<any>([])
const orderNumList=ref<any>([])
async function initData(){
  orderAllData.value=await readOrderAllData(selectdRoadStation.value)
  orderNumList.value=getOrderSummaries(orderAllData.value)
}
initData()
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
function getOrderSummaries  (data: any) {
  const orderSummaries: { [key: string]: { count: number; totalMoney: number } } = {};

  for (const uniqueKey in data) {
    const orders = data[uniqueKey];
    for (const timestamp in orders) {
      const orderDetails = orders[timestamp];
      const orderName = orderDetails.orderName;
      const totalMoney = orderDetails.totalMoney;
      
      if (orderName in orderSummaries) {
        orderSummaries[orderName].count++;
        orderSummaries[orderName].totalMoney += totalMoney;
      } else {
        orderSummaries[orderName] = {
          count: 1,
          totalMoney: totalMoney
        };
      }
    }
  }

  return Object.keys(orderSummaries).map(orderName => ({
    orderName,
    count: orderSummaries[orderName].count,
    totalMoney: orderSummaries[orderName].totalMoney
  }));
};
type Order = {
  orderName: string;
  count: number;
  totalMoney: number;
};
// CSV変換
const convertToCSV = (data: Order[]): string => {
  const headers = Object.keys(data[0]).join(','); // ヘッダー行を作成
  const rows = data.map(obj => Object.values(obj).join(',')); // 各オブジェクトをCSV行に変換
  return [headers, ...rows].join('\n');
};
const downloadCSV = (csv: string, filename: string) => {
  const bom = "\uFEFF"; // BOMを追加
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
function pushExport(){
  const CSVfile=convertToCSV(orderNumList.value)
  const now = new Date()
  const currentTime = now.toLocaleString()
  const fileName="購入者リスト_"+currentTime
  downloadCSV(CSVfile,fileName)
}
</script>
<template>
<h1>購入者リスト</h1>
<!-- {{orderAllData}} -->
 <p>{{ orderNumList }}</p>
<select class="form-select" aria-label="roadsideStationSelect" v-model="selectdRoadStation" @change="initData">
  <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation >{{roadStation}}</option>
</select>
<div class="buyer-group">
  <h3>注文者名</h3>
  <h3>件数</h3>
 </div>
<div v-for="(element,index) in orderNumList" :key="index">
  <!-- <p>{{element}}</p> -->
  <!-- <p>{{index}}</p> -->
  
   <div class="buyer-group">
    <h3>{{element.orderName}}</h3>
    <h3>{{element.count}}件</h3>
   </div>
</div>
<button v-on:click="pushExport" class="buyer-button">出力する</button>
</template>
<style>
.buyer-group{
  display: flex;
  width: 600px;
  justify-content: space-between;
  margin: 10px 30px;
}
.buyer-button{
  background-color: white;
  margin: 1%;
}
</style>