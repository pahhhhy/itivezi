<script setup lang="ts">
import { ref,watch} from 'vue'
interface datatables{
    en:number;
    farmer:string
    roadStation:string
    state:State
    uid:string
    unit:string
    photo:string
}
interface Props {
  data:datatables
  uniqueKey:string|number
  vegeName:string|number
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:State
            uid:string
            unit:string
            photo:string
        }
    }
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
import { useOrderDataStore } from '@/stores/orderData';
const OrderDataStore=useOrderDataStore()
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
    
function onPushCard(){
    if(typeof props.vegeName !== 'number'&&typeof props.uniqueKey !== 'number'){
        let uproadData: Vegetables = {
            [props.vegeName]: {
            [props.uniqueKey]: props.data
            }
        };
        OrderDataStore.roadData(uproadData)
    }
    
    
}
</script>
<template>
<!-- <h4>{{props.data}}</h4>
<p>{{props.uniqueKey}}</p> -->

  <div class="card" style="width: 18rem;" v-on:click="onPushCard">
    <img :src="props.data.photo" class="card-img-top" alt="..." v-if="props.data.photo!='none'">
    <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.data.photo=='none'">
    <div class="card-body">
        <h5 class="card-title">{{props.data.farmer}}</h5>
      <p class="card-text">値段:{{props.data.en}}</p>
      <p class="card-text">単価:{{props.data.unit}}</p>
      <p class="card-text">卸先:{{props.data.roadStation}}</p>
    </div>
  </div>
</template>
<style scoped>
    .card{
        margin: 10px;
        width: 280px;
        height: 380px;
    }
    .card img{
        height: 50%;
    }
</style>