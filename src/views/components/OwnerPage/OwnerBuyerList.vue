<script setup lang="ts">
import {ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import {useRoadStationStore} from "../../../stores/roadStation"

const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const selectedRoadStation = ref<string>(roadStationUnitTempList.value[0])
const orderAllData = ref<any>([])
const orderNumList = ref<any>([])
const yearList = ref<number[]>([])
const selectStartYear = ref<number>(2024)
const selectStartMonth = ref<number>(1)
const selectEndYear = ref<number>(2024)
const selectEndMonth = ref<number>(12)
const startDate = ref<Date>(new Date(2024, 8, 1));  // 4月 (0ベースなので3月が4月を指す)
const endDate = ref<Date>(new Date(2024, 9, 31));    // 10月 (0ベースなので9月が10月を指す)
async function initData() {
  orderAllData.value = await readOrderAllData(selectedRoadStation.value)
  yearList.value = getYearsFromData(orderAllData.value)
  orderNumList.value = getOrderSummaries(orderAllData.value, startDate.value, endDate.value)
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

function getYearsFromData(data: any): number[] {
  const yearsSet = new Set<number>();

  for (const uniqueKey in data) {
    const orders = data[uniqueKey];
    for (const timestamp in orders) {
      const year = parseInt(timestamp.split('-')[0], 10);
      yearsSet.add(year);
    }
  }

  // Setから配列に変換して返す
  return Array.from(yearsSet);
}

function getOrderSummaries(data: any, startDate: Date, endDate: Date) {
  const orderSummaries: { [key: string]: { count: number; totalMoney: number } } = {};

  for (const uniqueKey in data) {
    const orders = data[uniqueKey];
    for (const timestamp in orders) {
      // 日付の部分を取り出してDateオブジェクトに変換
      const orderDateParts = timestamp.split('-');
      const orderYear = parseInt(orderDateParts[0], 10);
      const orderMonth = parseInt(orderDateParts[1], 10) - 1; // 月は0から始まるので-1
      const orderDate = new Date(orderYear, orderMonth);

      // フィルタリング: orderDateがstartDateとendDateの範囲内かを確認
      if (orderDate >= startDate && orderDate <= endDate) {
        const orderDetails = orders[timestamp];
        const orderName = orderDetails.orderName;
        const totalMoney = orderDetails.totalMoney;

        if (orderName in orderSummaries) {
          orderSummaries[orderName].count++;
          orderSummaries[orderName].totalMoney += totalMoney;
        } else {
          orderSummaries[orderName] = {
            count: 1,
            totalMoney: totalMoney,
          };
        }
      }
    }
  }

  return Object.keys(orderSummaries).map(orderName => ({
    orderName,
    count: orderSummaries[orderName].count,
    totalMoney: orderSummaries[orderName].totalMoney,
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


  orderNumList.value = getOrderSummaries(orderAllData.value, startDate.value, endDate.value)
}
</script>
<template>
  <h1>購入者リスト</h1>
  <!-- {{orderAllData}} -->
  <!-- {{ yearList }}
  <p>{{ orderNumList }}</p> -->
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