<script setup lang="ts">
import {ref,watch} from 'vue'
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
    roadStation:string
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
interface titleDataTables{
  orderTime: string, 
  orderName: string, 
  state: string
}
interface orderVegeElementTables{
    [num:number]:{
    en:number;
    farmer:string
    roadStation:string
    state:VegeState
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}}
const FireOrderStore=useFireOrderStore()
const AllOrderData=ref<Ordertables>(FireOrderStore.OrderAllData)
const vegeData=ref<orderVegeElementTables>(getNumData(AllOrderData.value))
const titleData=ref<titleDataTables[]>(extractOrderInfo(AllOrderData.value))
  watch(() => FireOrderStore.OrderAllData, (newUser) => {
  AllOrderData.value = newUser;
  titleData.value=extractOrderInfo(AllOrderData.value)
});
function pushActive() {
  isActive.value = !isActive.value
}

function extractOrderInfo(ordertables: Ordertables) {
    const result: titleDataTables[] = [];

    for (const uid in ordertables) {
        for (const uniqueKey in ordertables[uid]) {
            const order = ordertables[uid][uniqueKey];
            result.push({
                orderTime: order.orderTime,
                orderName: order.orderName,
                state: order.state,
            });
        }
    }

    return result.reverse();
}
function getNumData(orderTable: Ordertables): orderVegeElementTables {
  const numData: orderVegeElementTables = {};

  // Ordertablesの各UIDに対して処理
  Object.values(orderTable).forEach((userOrders) => {
    // 各uniqueKeyのOrdertablesElementに対して処理
    Object.values(userOrders).forEach((orderElement) => {
      // 数値キーに対応する部分を抽出
      Object.keys(orderElement)
        .filter((key) => !isNaN(Number(key))) // 数値のキーのみを抽出
        .forEach((key) => {
          const numKey = Number(key);
          const element = orderElement[numKey];
          
          // 空でないことを確認して追加
          if (element && Object.keys(element).length > 0) {
            numData[numKey] = element; // 数値キーに対応するデータを追加
          }
        });
    });
  });

  return numData;
}
// 選択されたインデックスを保存するための状態
const isActive = ref<boolean>(false)
const selectedTableList = ref<boolean[]>([])
const selectedTableUnitList = ref<any>([])
const sortedOrderData = ref<any>({})
const state = ref<string[]>([])
const isFilter = ref<boolean>(false)

function getGroupData(data: any) {
  // 結果を格納するオブジェクトを準備
  const groupedData: any = {
    "全て": {...data},
    "取引完了": {},
    "連絡済み": {},
    "未連絡": {}
  };
  // データを state によって分ける
  for (const key in data) {
    const state = data[key].state;
    if (groupedData[state]) {
      groupedData[state][key] = data[key];
    }
  }
  return groupedData
}

const labels = ['全て', '未連絡', '連絡済み', '取引完了', '取引取り消し'];
const selectedClass = ref<number>(0);

function toggleClass(index: number) {
  selectedClass.value = index;
  for (let i: number = 0; i < selectedTableList.value.length; i++) {
    selectedTableList.value[i] = false
  }

}
</script>
<template>
  {{ titleData }}
  <h1>注文履歴</h1>
  <!-- {{props.vegeAllOrder}} -->
  <!-- {{ sortedOrderData["全て"] }} -->
  <!-- {{selectedTableUnitList["2024-8-22-11-22-0"]}} -->
  <div class="filter-nav">
    <h2>フィルター</h2>
    <div class="filter-unit">
      <button v-for="(label, index) in labels" :key="index" @click="toggleClass(index)"
              :class="{ 'active': selectedClass === index }">
        {{ label }}
      </button>
    </div>
  </div>
  <article v-if="!isActive">
    <div class="orderList-group">
      <div class="order-table">
        <p>注文時間</p>
        <p>名前</p>
        <p>連絡</p>
      </div>
      <div v-for="(element,index) in titleData" :key="index" class="order-table">
        <p>{{ element["orderTime"] }}</p>
        <p>{{ element["orderName"] }}</p>
        <p>{{ element["state"] }}</p>
      </div>
    </div>
    <button v-on:click="pushActive" class="orderList-button">確認する</button>
  </article>
  <article v-if="isActive">

    <div class="orderList-group-active">
      <div class="order-table">
        <p>注文時間</p>
        <p>名前</p>
        <p>状態</p>
        <p></p>
      </div>
      <!-- <article v-if="!isFilter">
        <div v-for="(element,time,index) in sortedOrderData[labels[selectedClass]]" :key="element"
             class="order-table-active">
          <div class="order-table-unit" v-on:click="selectOrderData(index)">

            <p>{{ element["key"] }}</p>
            <p>{{ element["orderName"] }}</p>
            <p>{{ element["state"] }}</p>
            <i class="bi bi-chevron-down" v-if="!selectedTableList[index]"></i>
            <i class="bi bi-chevron-up" v-if="selectedTableList[index]"></i>
          </div>

          <div class="order-table-selected" v-if="selectedTableList[index]">
            <div v-for="(vegeData,number) in selectedTableUnitList[time]" v-bind:key="number"
                 class="order-table-selected-unit">
              <h3>{{ vegeData["vegeName"] }}</h3>
              <p>単位：{{ vegeData["unit"] }}</p>
              <p>個数：{{ vegeData["amount"] }}組</p>
              <p>農家名：{{ vegeData["farmerName"] }}</p>
              <p>料金：{{ vegeData["price"] }}円</p>
            </div>
          </div>
          <div v-if="selectedTableList[index]" style="margin:0% 10%;">
            <p>希望日：{{ element["selectDate"] }}</p>
            <p>合計金額:{{ element["totalMoney"] }}円</p>
            <p style="display:flex">ステータス:<select class="form-select" aria-label="select-startyear"
                                                       v-model="state[index]"
                                                       v-on:change="changeState(state[index],element.unique,element.key)">
              <option value="未連絡">未連絡</option>
              <option value="連絡済み">連絡済み</option>
              <option value="取引完了">取引完了</option>
              <option value="取引取り消し">取引取り消し</option>
            </select></p>
          </div>
        </div>
      </article> -->

    </div>
    <button v-on:click="pushActive" class="orderList-button">更新する</button>
  </article>
</template>
<style>
.form-select {
  width: 30% !important;
}

.order-table {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 1px solid gray;
  border-top: 1px solid gray
}

.order-table-selected {
  display: flex;
  margin: 0% 10%;

}

.order-table-unit {
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  border-bottom: 1px solid gray;
  border-top: 1px solid gray
}

.order-table-selected-unit {
  padding: 3%
}

.orderList-group {
  margin: 10px;
  font-size: large
}

.orderList-group-active {

  font-size: large
}

.orderList-button {
  background-color: white;
  font-size: 1.2rem;
  padding: 5px;
  margin: 5px;
  border-radius: 10px;
}

.filter-unit button {
  background-color: white;
  padding: 10px;
  margin: 5px 5px;
}

.filter-unit button.active {
  background-color: rgb(175, 175, 175);
}
</style>