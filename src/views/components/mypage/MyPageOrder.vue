<script setup lang="ts">
import { ref,watch } from 'vue'
import { type User } from 'firebase/auth'
import { useFireOrderStore } from '@/stores/fireOrder';
import MyOrderElements from './MyOrderElements.vue';
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
}

interface Props {
  currentUser: User | null
}

const props = defineProps<Props>()
const FireOrderStore=useFireOrderStore()
const AllOrderData=ref<Ordertables>(FireOrderStore.OrderAllData)
const isToggle = ref<boolean>(false)
watch(() => FireOrderStore.OrderAllData, (newUser) => {
  AllOrderData.value = newUser;
});
function pushToggle() {
  isToggle.value = !isToggle.value;
}

</script>
<template>
  <!-- <h1>{{ nyOrderKeys }}</h1>-->
  <!-- <p>{{ myOrderData}}</p> -->
  <!-- {{myOrderVegeData}} -->
  <!-- <h3>{{ nyOrderKeysNum }}</h3> -->
  <!-- <h3>{{ OrderTimeList }}</h3> -->
   <article class="myorder_card" v-if="props.currentUser!=null">
    <h2>過去の注文</h2>
    <article class="myorder_elementgroup">
      <div v-for="(element,uniqueKey) in  AllOrderData[props.currentUser.uid]" :key="uniqueKey">
        <MyOrderElements
          v-bind:data="element"
          ></MyOrderElements>
      </div>
    </article>
   </article>
</template>
<style>
.myorder_card{
  width: 340px;
  height: 250px;
  border: none;
  background-color: white;
  border-radius: 5px;
  margin :20px auto;
  padding: 5px 20px;
}
.myorder_card h2{
  border-bottom: 1px solid var(--text-color);
}
.myorder_elementgroup{
  overflow-y: scroll;
  height: 200px;
}
</style>
