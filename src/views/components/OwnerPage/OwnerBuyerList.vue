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
place:string
}
interface BuyerListTable {
  orderName: string;
  count: number;
  totalMoney: number;
};
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
if(roadStationUnitTempList.value.includes("全て")){
  roadStationUnitTempList.value.unshift("全て");
}

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
const endDate = ref<Date>(new Date(2025, 9, 31));   // 10月 (0ベースなので9月が10月を指す)
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
  console.log(fliterOrderData.value)
  //抽出したデータからBuyerListの作成
  orderNumList.value = generateBuyerListTable(fliterOrderData.value)
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
    // 空文字キーをスキップ
    if (!uid) continue;

    const uniqueKeyOrders = orders[uid];

    // uniqueKey ごとに注文情報を集計
    for (const uniqueKey in uniqueKeyOrders) {
      const order = uniqueKeyOrders[uniqueKey];

      // 必須フィールドと型を確認
      if (
        typeof order !== "object" ||
        typeof order.orderName !== "string" ||
        typeof order.totalMoney !== "number" ||
        typeof order.state !== "string"
      ) {
        continue; // 型が正しくない場合は無視
      }

      // state が OrderStete.Completed の場合のみ処理する
      if (order.state === "取引完了") { // `OrderStete.Completed` に対応
        const { orderName, totalMoney } = order;

        // 既に orderName が buyerList に存在するか確認
        if (!buyerList[orderName]) {
          // 初めての場合、初期値を設定
          buyerList[orderName] = { count: 0, totalMoney: 0 };
        }

        // 注文件数をカウントし、総額を加算
        buyerList[orderName].count += 1;
        buyerList[orderName].totalMoney += totalMoney;
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
  <article class="UserList-card">
    <h1>購入者リスト</h1>
    <p>※取引完了の総額です。</p>
    <table>
        <caption>購入者のデータ</caption>
        <thead>
          <tr>
            <th scope="col" class="name">名前</th>
            <th scope="col" class="role">件数</th>
            <th scope="col" class="phone">総額</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(element,uid) in orderNumList" :key="uid">
              <th>{{ element.orderName }}</th>
              <th>{{ element.count }}件</th>
              <th>{{ element.totalMoney }}円</th>
          </tr>
        </tbody>
      </table>
      <button v-on:click="pushExport" class="buyer-button">出力する</button>
  </article>
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
  {{ orderAllData }}
  <p></p>
  {{ fliterOrderData.value }}
  <p></p>
  {{ orderNumList }}
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
.UserList-card{
  width: 340px;
  height: 600px;
  margin: 0 auto;
  border: 10px;
  background-color: white;
  margin-top: 20px;
  overflow: scroll;
  padding: 10px;
}
.UserList-card h1{
  border-bottom: 1px solid black;
  padding-bottom: 2px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 16px;
  text-align: left;
  table-layout: fixed; /* 各列の幅を固定 */
}

th, td {
  border: 1px solid #ddd;
  text-align: center;
  
}
/* 各列の幅調整 */
th.name, td.name {
  width: 85px;
  height: 30px!important;
}

th.role, td.role {
  width: 50px; 
}

th.phone, td.phone {
  width: 100px; }

th.email, td.email {
  width: 200px; 
}

th.aff, td.aff {
  width: 150px; 
}

th.place, td.place {
  width: 300px; 
}

th.uid, td.uid {
  width: 300px; 
}

th.delete, td.delete {
  width: 50px; 
  text-align: center;
}

/* ホバーエフェクト */
tbody tr:hover {
  background-color: #f1f1f1;
}
th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f1f1f1;
}

thead th {
  border-bottom: 2px solid #ddd;
}

.caption {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
}
</style>