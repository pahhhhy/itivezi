<script setup lang="ts">
import { ref} from 'vue'
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
  state:string
  totalMoney:number
}
interface orderVegeElementTables{
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
interface Props {
  data:OrdertablesElement
}

const props = defineProps<Props>()
  const vegeElementList=ref<orderVegeElementTables>(getNumData(props.data))
function getNumData(orderTable: OrdertablesElement) {
  // 数値キーに対応する部分を取り出す
  const numData = Object.keys(orderTable)
    .filter((key) => !isNaN(Number(key))) // 数値のキーのみを抽出
    .map((key) => orderTable[Number(key)]); // 数値のキーに対応するデータを取得

  return numData;
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
</template>
<style scoped>

</style>