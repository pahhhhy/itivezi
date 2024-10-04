<script setup lang="ts">
import { ref} from 'vue'
enum State{
  Discontinued="Discontinued",
  Available="Available"
}
interface vegeElementTables{
  en:number
  farmer:string
  roadStation:string
  state:State
  uid:string
  unit:string
  photo:string
}
interface Props {
  vegeName: string|number
  vegeData:vegeElementTables
  selectData:orderVegeElementTables
  index:number
}
interface Emits {
  (event: 'getTotalMoney', money: number): void
  (event: 'getVegeCount', Count: number,index:number): void
}
interface orderVegeElementTables{
    en:number;
    farmer:string
    roadStation:string
    state:State
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const vegeCount=ref<number>(props.selectData.amount)
const totalMoney=ref<number>(vegeCount.value*props.vegeData.en)
    function changeMoney(money: number) {
  // マイナスの値になることを防ぐ
  if (vegeCount.value< 0) {
      vegeCount.value = 0
    } 
    let difference=vegeCount.value* money
    
    difference=difference-totalMoney.value
    emit("getTotalMoney",difference)
    emit("getVegeCount",vegeCount.value,props.index)
    totalMoney.value=vegeCount.value* money
}
emit("getTotalMoney",totalMoney.value)
emit("getVegeCount",vegeCount.value,props.index)
</script>
<template>
    <td>{{ vegeName }}</td>
    <td>{{ vegeData.farmer }}</td>
    <td>{{ vegeData.unit }}</td>
    <td>{{ vegeData.en }}</td>
    <td><input
        class="form-control"
        type="number"
        placeholder="何組買いますか？"
        aria-label="default input example"
        v-model="vegeCount"
        @change="
          changeMoney(vegeData.en )
        "
        /></td>
        <td>{{totalMoney}}円</td>
</template>
<style scoped>

</style>