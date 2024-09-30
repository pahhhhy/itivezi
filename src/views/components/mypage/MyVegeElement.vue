<script setup lang="ts">
import { ref,watch} from 'vue'

interface Props {
  VegeData:datatable
  unique:string|number
}
interface Emits {
  (event: 'deleteVegeData', unique: string|number,vegeName:string,): void
  (event: 'changeVegeData', unique: string|number,vegedata:datatable,): void
}
interface datatable {
  en:number;
  farmer:string
  roadStation:string
  state:string
  uid:string
  unit:string
  photo:string
  VegeName:string
}

const emit = defineEmits<Emits>()
const props = defineProps<Props>()
function deleteVegeData(){
  emit("deleteVegeData",props.unique,props.VegeData.VegeName)
}
function changeVegeData(){
  emit("changeVegeData",props.unique,props.VegeData)
}
</script>
<template>
<td><img :src="props.VegeData.photo" class="card-img-top" alt="..." v-if="props.VegeData.photo!='none'">
    <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.VegeData.photo=='none'"></td>
<td>{{props.VegeData.VegeName}}</td>
<td>{{props.VegeData.unit}}</td>
<td>{{props.VegeData.en}}</td>
<td>{{props.VegeData.roadStation}}</td>
<td><button v-on:click="changeVegeData">編集</button></td>
<td><button v-on:click="deleteVegeData">削除</button></td>
</template>
<style scoped>
.card-img-top{
  height: 150px;
}
</style>