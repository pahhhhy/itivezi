<script setup lang="ts">
import { ref} from 'vue'

interface orderVegeElementTables{
    [num:number]:{
    en:number;
    farmer:string
    roadStation:string
    state:string
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}
}
interface OrdertablesElement{
  [num:number]:{
    en:number;
    farmer:string
    roadStation:string
    state:string
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
  state:string
  totalMoney:number
}
interface Props {
  data: OrdertablesElement
  vegeAlldata:Vegetables
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:string
            uid:string
            unit:string
            photo:string
        }
    }
}
interface Emits {
  (event: 'getSelectData', data: orderVegeElementTables): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const vegeElementList=ref<orderVegeElementTables>(getNumData(props.data))
const canBuy=ref<boolean>()
function getCanBuy(){
    canBuy.value=true
    for(let i:number=0;i<Object.keys(vegeElementList.value).length;i++){
        if(!isAvailableState(props.vegeAlldata,vegeElementList.value[i].VegeName,vegeElementList.value[i].unique)){
            canBuy.value=false
        }
    }
}
getCanBuy()
function getNumData(orderTable: OrdertablesElement) {
  // 数値キーに対応する部分を取り出す
  const numData = Object.keys(orderTable)
    .filter((key) => !isNaN(Number(key))) // 数値のキーのみを抽出
    .map((key) => orderTable[Number(key)]); // 数値のキーに対応するデータを取得

  return numData;
}
function isAvailableState(vegetables: Vegetables, vegeName: string, uniqueKey: string): boolean {
  // 指定された vegeName と uniqueKey が存在するか確認
  if (vegetables[vegeName] && vegetables[vegeName][uniqueKey]) {
    // state が "Available" かを判定
    return vegetables[vegeName][uniqueKey].state === "Available";
  }
  return false; // 存在しない場合や "Available" でない場合は false
}
function onPushBuy(){
  emit("getSelectData",vegeElementList.value)
}
</script>
<template>
<td>{{props.data.orderTime}}</td>
<td> 
    <table>
        <thead>
            <tr>
                <th scope="col">野菜名</th>
                <th scope="col">農家名</th>
                <th scope="col">販売単位</th>
                <th scope="col">単価</th>
                <th scope="col">購入個数</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(vegeData,index) in vegeElementList" :key="index">
                <td>{{vegeData.VegeName}}</td>
                <td>{{vegeData.farmer}}</td>
                <td>{{vegeData.unit}}</td>
                <td>{{vegeData.en}}</td>
                <td>{{vegeData.amount}}</td>
            </tr>
        </tbody>
    </table>
</td>
<td> {{props.data.totalMoney}}円</td>
<td>{{props.data.selectData}}</td>
<td><button class="btn btn-success" v-show="canBuy" v-on:click="onPushBuy()">再度注文</button> <h4 v-show="!canBuy">販売停止</h4></td>
</template>
<style scoped>

</style>