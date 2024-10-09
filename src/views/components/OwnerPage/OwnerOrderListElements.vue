<script setup lang="ts">
import { ref,watch} from 'vue'
import { useFireOrderStore } from '@/stores/fireOrder';
interface Props {
  titleData: titleDataTables
  vegeData:OrdertablesNumElement
  OrderData:OrdertablesElement
  unique:string
  uid:string
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
enum OrderStete{
  Completed="取引完了",
  Uncontacted="未連絡",
  contacted="連絡済み",
  cancel="取引取り消し"
}
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
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
interface OrdertablesNumElement{
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

interface titleDataTables{
  orderTime: string, 
  orderName: string, 
  state: string,
  uid:string,
  unique:string
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const isActive=ref<boolean>(false)
const FireOrderStore=useFireOrderStore()
const orderData=ref<OrdertablesElement>(props.OrderData)
const state=ref<OrderStete>(props.OrderData.state)
const totalMoney=ref<number>(props.OrderData.totalMoney)
function selectOrderData(){
    isActive.value=!isActive.value
}
function changeState(){
  orderData.value.state=state.value
  FireOrderStore.updateOrderState(orderData.value,props.uid,props.unique)
}
</script>
<template>
  <div class="order-table" v-on:click="selectOrderData()">
    <p>{{ props.titleData["orderTime"] }}</p>
    <p>{{ props.titleData["orderName"] }}</p>
    <p>{{ props.titleData["state"] }}</p>
    <i class="bi bi-chevron-down" v-if="!isActive"></i>
    <i class="bi bi-chevron-up" v-if="isActive"></i>
  </div>
  <div class="order-table-selected" v-if="isActive">
    <div v-for="(Data,number) in props.vegeData" v-bind:key="number" class="order-table-selected-unit">
      <h3>{{ Data.VegeName }}</h3>
      <p>単位：{{ Data.unit }}</p>
      <p>個数：{{ Data.amount }}組</p>
      <p>農家名：{{ Data.farmer }}</p>
      <p>料金：{{ Data.en }}円</p>
    </div>
  </div>
  <div v-if="isActive">
    <h3>合計金額：{{totalMoney}}円</h3>
    <h3>希望日：{{props.OrderData.selectData}}</h3>
    <h3 style="display: flex;">ステータス:<select class="form-select" aria-label="select-startyear" v-model="state" v-on:change="changeState">
      <option :value="OrderStete.Uncontacted">{{OrderStete.Uncontacted}}</option>
      <option :value="OrderStete.contacted">{{OrderStete.contacted}}</option>
      <option :value="OrderStete.Completed">{{OrderStete.Completed}}</option>
      <option :value="OrderStete.cancel">{{OrderStete.cancel}}</option>
    </select></h3>
    
  </div>
</template>
<style scoped>
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
.order-table-selected {
  display: flex;
  margin: 0% 10%;

}
</style>