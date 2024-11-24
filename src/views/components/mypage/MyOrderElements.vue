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
  <article class="myorder_element">
    <img :src="props.data.photo" class="card-img-top" alt="..." v-if="props.VegeData.photo!='none'">
    <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.VegeData.photo=='none'">
  </article>
</template>
<style scoped>
.myorder_element{
  display: flex;
  height: 70px;
  width: 270px;
}
</style>