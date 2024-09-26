<script setup lang="ts">
import { ref} from 'vue'
interface CartElementTables{
    en:number;
    farmer:string
    roadStation:string
    unit:string
    photo:string
    unique:string
    vegeName:string
    amount:number
}

interface Props {
  data:CartElementTables
}
interface Emits {
  (event: 'getTotalMoney', totalMoney: number): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const totalMoney=ref<number>(props.data.en*props.data.amount)

emit("getTotalMoney",totalMoney.value)
</script>
<template>
<td>
    <div>
        <img :src="props.data.photo" class="card-img-top" alt="..." v-if="props.data.photo!='none'">
        <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.data.photo=='none'">
        <h4>【 {{props.data.farmer}} 産】{{props.data.vegeName}}</h4>
        <p>価格: {{props.data.en}} 円</p>
        <p>卸先:{{props.data.roadStation}}</p>
    </div>
</td>
<td>{{props.data.unit}}</td>
<td>{{props.data.amount}}</td>
<td>{{totalMoney}}</td>
</template>
<style scoped>
td >img{
    height: 30%;
}
</style>