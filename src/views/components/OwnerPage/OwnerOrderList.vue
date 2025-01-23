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
  state: OrderStete,
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
const isfliter=ref<boolean>(false)
const selectfliter=ref<string>("全て")
const labels = [ "全て",OrderStete.Uncontacted, OrderStete.contacted, OrderStete.Completed, OrderStete.cancel];
  watch(() => FireOrderStore.OrderAllData, (newUser) => {
  AllOrderData.value = newUser;
  titleData.value=extractOrderInfo(AllOrderData.value)
});

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


function toggleClass(mode: OrderStete|string) {
  let filterData:Ordertables={}
  switch (mode){
    case OrderStete.contacted:
      
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.contacted)
      break;
      case OrderStete.Uncontacted:
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.Uncontacted)
      break;
      case OrderStete.Completed:
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.Completed)
      break;
      case OrderStete.cancel:
      filterData=getCompletedOrders(AllOrderData.value,OrderStete.cancel)
      break;
      default:
        filterData=AllOrderData.value
        break;
  }
  titleData.value=extractOrderInfo(filterData)
  AllOrderDataNum.value=convertOrdertablesToNum(filterData)
}
function onpushfilter(){
  isfliter.value=!isfliter.value
}
</script>
<template>
  <article class="orderList-card">
    <h1>注文履歴</h1>
    <button v-on:click="onpushfilter">
      フィルター
      <i class="bi bi-chevron-down" v-if="!isfliter"></i>
      <i class="bi bi-chevron-up" v-if="isfliter"></i>
    </button>
    <article class="filter-tab" v-if="isfliter">
      <h3>ステータス</h3>
      <div class="fliter-button-group">
        <div v-for="(element,index) in labels" v-bind:key="index" class="filter_button">
          <input
            class="form-check-input"
            type="radio"
            :value="element"
            v-model="selectfliter"
            v-on:click="toggleClass(element)"
            :id="'flexCheckIndeterminate' + index"
          />
          <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
            {{ element }}
          </label>
      </div>
      
      </div>
    </article>
    <article v-if="Object.keys(titleData).length==0">データがありません</article>
    <article class="dataList" v-if="Object.keys(titleData).length!=0">
      <div v-for="(element,index) in titleData" :key="index" >
        <OwnerOrderListElements
        v-bind:title-data="element"
        v-bind:unique="element.unique"></OwnerOrderListElements>
      </div>
    </article>
  </article>
  
</template>
<style>
.orderList-card{
  width: 512px;
  padding: 20px;
  min-height: 600px;
  border-radius: 10px;
  background-color: white;
  margin: 0 auto;
  margin-top: 20px;
}
.orderList-card h1{
  border-bottom: 1px solid black;
}
.orderList-card button{
  height: 40px;
  width: 100px;
  border-radius: 5px;
  color: white;
  text-align: center;
  background-color: var(--other-color);
  border: none;
  margin: 0 10px;
}
.filter-tab{
  border-radius: 10px;
  border: 1px solid var(--line-color);
  padding: 10px;
  margin-top: 10px;
}
.filter-tab h3{
  border-bottom: 1px solid black;
}
.fliter-button-group{
  display: flex;
  flex-wrap: wrap;
  
}
.filter_button{
  width: 120px;
}
.form-check-label{
  margin-left: 5px;
}
.dataList{
  margin-top: 10px;
  height: 450px;
  overflow-y: scroll;
  overflow-x:hidden ;
}
.dataList::-webkit-scrollbar {
  width:0px;
}
.dataList::-webkit-scrollbar-thumb {
  background: var(--line-color);
  width: 6px;
  height: 1px;
  border-radius: 5px;
}
@media (max-width: 575.98px) { 
  .orderList-card{
      width: 340px;
      padding: 10px;
  }
}
</style>