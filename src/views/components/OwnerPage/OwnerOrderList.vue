<script setup lang="ts">
import {ref,watch} from 'vue'
import { useFireOrderStore } from '@/stores/fireOrder';
import OwnerOrderListElements from './OwnerOrderListElements.vue';
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
interface titleDataTables{
  orderTime: string, 
  orderName: string, 
  state: string,
  uid:string,
  unique:string
}
interface OrdertablesNum{
    [uid:string]:{
        [uniqueKey:string]:{
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
    }
  }
}
const FireOrderStore=useFireOrderStore()
const AllOrderData=ref<Ordertables>(FireOrderStore.OrderAllData)
const AllOrderDataNum=ref<OrdertablesNum>(convertOrdertablesToNum(AllOrderData.value))
const titleData=ref<titleDataTables[]>(extractOrderInfo(AllOrderData.value))
  watch(() => FireOrderStore.OrderAllData, (newUser) => {
  AllOrderData.value = newUser;
  titleData.value=extractOrderInfo(AllOrderData.value)
});
function pushActive() {
  isActive.value = !isActive.value
}
function getCompletedOrders(ordertables: Ordertables,filter:OrderStete): Ordertables {
    const completedOrders: Ordertables = {};

    for (const uid in ordertables) {
        const userOrders = ordertables[uid];
        const filteredOrders = Object.keys(userOrders)
            .filter((uniqueKey) => userOrders[uniqueKey].state === filter)
            .reduce((acc, uniqueKey) => {
                acc[uniqueKey] = userOrders[uniqueKey];
                return acc;
            }, {} as typeof userOrders);

        if (Object.keys(filteredOrders).length > 0) {
            completedOrders[uid] = filteredOrders;
        }
    }

    return completedOrders;
}
function extractOrderInfo(ordertables: Ordertables) {
    const result: titleDataTables[] = [];

    for (const uid in ordertables) {
        for (const uniqueKey in ordertables[uid]) {
            const order = ordertables[uid][uniqueKey];
            result.push({
                orderTime: order.orderTime, // そのまま保持
                orderName: order.orderName,
                state: order.state,
                uid:uid,
                unique:uniqueKey
            });
        }
    }

    // orderTimeのパース関数
    function parseOrderTime(orderTime: string): Date | null {
        if (!orderTime) {
            return null; // orderTimeがundefinedまたはnullの場合
        }
        
        const [year, month, day, hour, minute, second] = orderTime.split('-').map(Number);
        return new Date(year, month - 1, day, hour, minute, second);
    }

    // orderTimeで降順に並べ替え
    result.sort((a, b) => {
        const dateA = parseOrderTime(a.orderTime);
        const dateB = parseOrderTime(b.orderTime);

        // 両方の日付が有効でない場合、並べ替えしない
        if (!dateA || !dateB) return 0;
        
        return dateB.getTime() - dateA.getTime();
    });

    return result;
}

function convertOrdertablesToNum(orderTables: Ordertables): OrdertablesNum {
  const orderTablesNum: OrdertablesNum = {};

  for (const uid in orderTables) {
    if (!orderTablesNum[uid]) {
      orderTablesNum[uid] = {};
    }

    const userOrders = orderTables[uid];

    for (const uniqueKey in userOrders) {
      if (!orderTablesNum[uid][uniqueKey]) {
        orderTablesNum[uid][uniqueKey] = {};
      }

      const orderElement = userOrders[uniqueKey];

      for (const num in orderElement) {
        // `num` 以外のキーは無視する
        if (!isNaN(Number(num))) {
          orderTablesNum[uid][uniqueKey][num] = {
            en: orderElement[Number(num)].en,
            farmer: orderElement[Number(num)].farmer,
            roadStation: orderElement[Number(num)].roadStation,
            state: orderElement[Number(num)].state,
            unique: orderElement[Number(num)].unique,
            unit: orderElement[Number(num)].unit,
            photo: orderElement[Number(num)].photo,
            amount: orderElement[Number(num)].amount,
            VegeName: orderElement[Number(num)].VegeName,
          };
        }
      }
    }
  }

  return orderTablesNum;
}

// 選択されたインデックスを保存するための状態
const isActive = ref<boolean>(false)
const selectedTableList = ref<boolean[]>([])

const labels = ['全て', OrderStete.Uncontacted, OrderStete.contacted, OrderStete.Completed, OrderStete.cancel];
const selectedClass = ref<number>(0);

function toggleClass(index: number) {
  selectedClass.value = index;
  for (let i: number = 0; i < selectedTableList.value.length; i++) {
    selectedTableList.value[i] = false
  }

  let filterData:Ordertables={}
  switch (index){
    case 0:
      filterData=AllOrderData.value
      break;
      case 1:
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.Uncontacted)
      break;
      case 2:
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.contacted)
      break;
      case 3:
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.Completed)
      break;
      case 4:
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.cancel)
      break;
  }
  titleData.value=extractOrderInfo(filterData)
  AllOrderDataNum.value=convertOrdertablesToNum(filterData)
}
</script>
<template>
  <!-- {{ titleData }}
  <p></p>
  {{ AllOrderDataNum }} -->
  <h1>注文履歴</h1>
  <!-- {{props.vegeAllOrder}} -->
  <!-- {{ sortedOrderData["全て"] }} -->
  <!-- {{selectedTableUnitList["2024-8-22-11-22-0"]}} -->
   <!-- {{ AllOrderData }} -->
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
      <template v-for="(element,index) in titleData" :key="index" >
        <OwnerOrderListElements
        v-bind:title-data="element"
        v-bind:vege-data="AllOrderDataNum[element.uid][element.unique]"
        v-bind:-order-data="AllOrderData[element.uid][element.unique]"
        v-bind:uid="element.uid"
        v-bind:unique="element.unique"></OwnerOrderListElements>
      </template>
      <div class="order-table-selected" v-if="isActive">

      </div>
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







.orderList-group {
  margin: 10px;
  font-size: large
}

.orderList-group-active {
  margin: 10px;
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