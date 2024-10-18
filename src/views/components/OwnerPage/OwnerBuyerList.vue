<script setup lang="ts">
import {ref,watch} from 'vue'
import {useRoadStationStore} from "../../../stores/roadStation"
import { useFireOrderStore } from '@/stores/fireOrder';
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
enum OrderStete{
  Completed="取引完了",
  Uncontacted="未連絡",
  contacted="連絡済み",
  cancel="取引取り消し"
}
interface Ordertables{
    [uid:string]:{
        [uniqueKey:string]:OrdertablesElement
    }
}
interface OrdertablesElement{
  [num:number]:{
    en:number;
    farmer:string
    roadStation:string[]
    state:VegeState
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}
  orderTime:string
  email:string
  orderName:string
  selectData:string
  state:OrderStete
  totalMoney:number
}
interface BuyerListTable {
  orderName: string;
  count: number;
  totalMoney: number;
};
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
roadStationUnitTempList.value.unshift("全て");
const selectedRoadStation = ref<string>(roadStationUnitTempList.value[0])

const fireOrderStore=useFireOrderStore()
const orderAllData = ref<Ordertables>(fireOrderStore.OrderAllData)
const fliterOrderData=ref<Ordertables>(orderAllData.value)
const orderNumList = ref<BuyerListTable[]>([])
const yearList = ref<number[]>([])
const selectStartYear = ref<number>(2024)
const selectStartMonth = ref<number>(1)
const selectEndYear = ref<number>(2024)
const selectEndMonth = ref<number>(12)
const startDate = ref<Date>(new Date(2024, 3, 1));  // 4月 (0ベースなので3月が4月を指す)
const endDate = ref<Date>(new Date(2024, 9, 31));   // 10月 (0ベースなので9月が10月を指す)
watch(() => fireOrderStore.OrderAllData, (newUser) => {
  orderAllData.value = newUser;
  initData()
}); 
async function initData() {
  //道の駅ごとにフィルターをやって
  if(selectedRoadStation.value=="全て"){

    fliterOrderData.value=orderAllData.value
  }else{
    fliterOrderData.value=filterRoadStationByRoomne(orderAllData.value,selectedRoadStation.value)
  }
  //全体のデータから年代の種類を取得する
  yearList.value = extractUniqueYears(fliterOrderData.value)
  //全体のデータからある範囲のデータに抽出する
  fliterOrderData.value= filterOrdersByDateRange(fliterOrderData.value,startDate.value,endDate.value)
  //抽出したデータからBuyerListの作成
  orderNumList.value = generateBuyerListTable(fliterOrderData.value)
}
//取引完了のものの総額を計算する
function getTotalMoney(data: Ordertables) {
  let totalCompletedMoney = 0;
  let countConplateOrder=0
  for (const orderId in data) {
    const orderDetails = data[orderId];
    for (const orderDate in orderDetails) {
      const order = orderDetails[orderDate];
      if (order.state === OrderStete.Completed) {
        totalCompletedMoney += order.totalMoney;
        countConplateOrder += 1
      }
    }
  }
  return totalCompletedMoney
}
function filterRoadStationByRoomne(orderTables: Ordertables, roadStation: string): Ordertables {
  // Create a deep copy of orderTables
  const filteredOrderTables: Ordertables = JSON.parse(JSON.stringify(orderTables));
  // Loop through each user's uid
  Object.entries(filteredOrderTables).forEach(([uid, uniqueEntries]) => {
    // Loop through each uniqueKey
    Object.entries(uniqueEntries).forEach(([uniqueKey, orderElement]) => {
      let fliterKey = Object.keys(orderElement);
      let fliternum = fliterKey.length - 6;

      for (let i: number = 0; i < fliternum; i++) {
        if (!orderElement[Number(fliterKey[i])].roadStation.includes(roadStation)) {
          delete filteredOrderTables[uid][uniqueKey][Number(fliterKey[i])];
        }
      }

      let afterfliterKey = Object.keys(filteredOrderTables[uid][uniqueKey]);
      let afterfilternum = afterfliterKey.length - 6;

      if (afterfilternum == 0) {
        delete filteredOrderTables[uid][uniqueKey];
      }
    });
  });

  return filteredOrderTables;
}
// 指定した範囲のデータを抽出する関数
function filterOrdersByDateRange(
  orders: Ordertables, // データのオブジェクト
  startDate: Date,     // 開始日時 (Date型)
  endDate: Date        // 終了日時 (Date型)
): Ordertables {
  const filteredOrders: Ordertables = {};

  // ユーザーIDごとにループ
  for (const uid in orders) {
    const uniqueKeyOrders = orders[uid];
    const filteredUniqueKeyOrders: { [uniqueKey: string]: OrdertablesElement } = {};

    // uniqueKeyごとにループして orderTime をチェック
    for (const uniqueKey in uniqueKeyOrders) {
      const order = uniqueKeyOrders[uniqueKey];
      const orderDate = parseOrderTime(order.orderTime);

      // 日時範囲に含まれる場合のみ追加
      if (orderDate >= startDate && orderDate <= endDate) {
        filteredUniqueKeyOrders[uniqueKey] = order;
      }
    }

    // フィルタされたデータがある場合のみユーザーIDに追加
    if (Object.keys(filteredUniqueKeyOrders).length > 0) {
      filteredOrders[uid] = filteredUniqueKeyOrders;
    }
  }

  return filteredOrders;
}

initData()
function extractUniqueYears(orders: Ordertables): number[] {
  const yearsSet: Set<number> = new Set();

  // ユーザーIDごとにループ
  for (const uid in orders) {
    const uniqueKeyOrders = orders[uid];

    // uniqueKeyごとに orderTime の年を抽出
    for (const uniqueKey in uniqueKeyOrders) {
      const order = uniqueKeyOrders[uniqueKey];
      
      // order.orderTime が存在するかチェック
      if (order.orderTime && typeof order.orderTime === "string") {
        // orderTime から年の部分を抽出し、数値に変換
        const year = parseInt(order.orderTime.split('-')[0], 10); // 年は orderTime の最初の部分にある
        
        // 数値の年を Set に追加 (重複は自動的に無視される)
        yearsSet.add(year);
      }
    }
  }

  // Set を配列に変換して返す (number[])
  return Array.from(yearsSet);
}

function generateBuyerListTable(orders: Ordertables): BuyerListTable[] {
  const buyerList: { [orderName: string]: { count: number, totalMoney: number } } = {};

  // ユーザーIDごとにループ
  for (const uid in orders) {
    const uniqueKeyOrders = orders[uid];

    // uniqueKey ごとに注文情報を集計
    for (const uniqueKey in uniqueKeyOrders) {
      const order = uniqueKeyOrders[uniqueKey];

      // state が OrderStete.Completed の場合のみ処理する
      if (order.state === OrderStete.Completed) {
        const { orderName, totalMoney } = order;

        // 既に orderName が buyerList に存在するか確認
        if (!buyerList[orderName]) {
          // 初めての場合、初期値を設定
          buyerList[orderName] = { count: 0, totalMoney: 0 };
        }

        // 注文件数をカウントし、総額を加算
        buyerList[orderName].count += 1;
        buyerList[orderName].totalMoney += totalMoney; // Use totalMoney from the order
      }
    }
  }

  // buyerList を BuyerListTable[] に変換して返す
  return Object.keys(buyerList).map(orderName => ({
    orderName,
    count: buyerList[orderName].count,
    totalMoney: buyerList[orderName].totalMoney
  }));
}


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
  const blob = new Blob([bom + csv], {type: "text/csv;charset=utf-8;"});
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function pushExport() {
  const CSVfile = convertToCSV(orderNumList.value)
  const now = new Date()
  const currentTime = now.toLocaleString()
  const fileName = "購入者リスト_" + currentTime
  downloadCSV(CSVfile, fileName)
}

function changeDate(data: { startYear?: number; endYear?: number; startMonth?: number; endMonth?: number; }) {
  if (data.startYear !== undefined) {
    startDate.value.setFullYear(data.startYear);
  }
  if (data.endYear !== undefined) {
    endDate.value.setFullYear(data.endYear)
  }
  if (data.startMonth !== undefined) {
    startDate.value.setMonth(data.startMonth - 1)
  }
  if (data.endMonth !== undefined) {
    endDate.value.setMonth(data.endMonth - 1)
  }
  initData()
}
// 日付の文字列を Date オブジェクトに変換するヘルパー関数
function parseOrderTime(orderTime: string | undefined): Date  {
  if (!orderTime || typeof orderTime !== "string") {
    console.log(orderTime)
    return new Date(2000, 12 - 1, 1); // orderTime が無効な場合は null を返す
  }

  const [year, month, day] = orderTime.split('-');
  
  // 日時が正しく分割されなければ null を返す
  if (!year || !month || !day) {
    console.log(orderTime)
    return new Date(2000, 12 - 1, 1);
  }

  return new Date(Number(year), Number(month) - 1, Number(day));
}
</script>
<template>
  <h1>購入者リスト</h1>
  <h3>フィルター</h3>
  <!-- {{ orderAllData }} -->
  <select class="form-select" aria-label="roadsideStationSelect" v-model="selectedRoadStation" @change="initData">
    <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation>
      {{ roadStation }}
    </option>
  </select>
  <div class="selectDate">
    <select class="form-select" aria-label="select-startyear" v-model="selectStartYear"
            v-on:change="changeDate({startYear:selectStartYear})">
      <option v-for="year in yearList" :key="year">{{ year }}</option>
    </select>
    <p>年</p>
    <select class="form-select" aria-label="select-startmonth" v-model="selectStartMonth"
            v-on:change="changeDate({startMonth:selectStartMonth})">
      <option v-for="month in 12" :key="month">{{ month }}</option>
    </select>
    <p>月</p>

  </div>
  <p style="margin: auto;">↓</p>
  <div class="selectDate">
    <select class="form-select" aria-label="select-startyear" v-model="selectEndYear"
            v-on:change="changeDate({endYear:selectEndYear})">
      <option v-for="year in yearList" :key="year">{{ year }}</option>
    </select>
    <p>年</p>
    <select class="form-select" aria-label="select-startmonth" v-model="selectEndMonth"
            v-on:change="changeDate({endMonth:selectEndMonth})">
      <option v-for="month in 12" :key="month">{{ month }}</option>
    </select>
    <p>月</p>
  </div>

  <h2>実際のデータ</h2>
  <div class="buyer-group">
    <h3>注文者名</h3>
    <h3>件数</h3>
    <h3>総額</h3>
  </div>
  <div v-for="(element,index) in orderNumList" :key="index">
    <!-- <p>{{element}}</p> -->
    <!-- <p>{{index}}</p> -->

    <div class="buyer-group">
      <h3>{{ element.orderName }}</h3>
      <h3>{{ element.count }}件</h3>
      <h3>{{ element.totalMoney }}円</h3>
    </div>
  </div>
  <p>※取引完了の総額です。</p>
  <button v-on:click="pushExport" class="buyer-button">出力する</button>
</template>
<style>
.buyer-group {
  display: flex;
  width: 600px;
  justify-content: space-between;
  margin: 10px 30px;
}

.buyer-button {
  background-color: white;
  margin: 1%;
}

.selectDate {
  display: flex;
  justify-content: space-between;
  align-items: center;

}

.selectDate p {
  width: 50px;
}
</style>