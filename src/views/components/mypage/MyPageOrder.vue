<script setup lang="ts">
import { ref,watch } from 'vue'
import { type User } from 'firebase/auth'
import { useFireOrderStore } from '@/stores/fireOrder';
import MyOrderElements from './MyOrderElements.vue';
import router from '@/router'
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

interface Props {
  currentUser: User | null
}

const props = defineProps<Props>()
const FireOrderStore=useFireOrderStore()
const AllOrderData=ref<Ordertables>(reverseOrdertables(FireOrderStore.OrderAllData))
watch(() => FireOrderStore.OrderAllData, (newUser) => {
  AllOrderData.value = newUser;
  AllOrderData.value=reverseOrdertables(AllOrderData.value)
});
function reverseOrdertables(data: Ordertables): Ordertables {
  const reversedData: Ordertables = {};
  
  // UIDごとに処理
  const reversedUids = Object.entries(data).reverse(); // UIDを逆順に
  for (const [uid, orders] of reversedUids) {
    reversedData[uid] = {};
    
    // uniqueKeyごとに処理
    const reversedOrders = Object.entries(orders).reverse(); // uniqueKeyを逆順に
    for (const [uniqueKey, orderElement] of reversedOrders) {
      reversedData[uid][uniqueKey] = orderElement;
    }
  }
  
  return reversedData;
}
function onPushAllview(){
  router.push("my-allorder")
}
</script>
<template>
  <!-- <h1>{{ nyOrderKeys }}</h1>-->
  <!-- <p>{{ myOrderData}}</p> -->
  <!-- {{myOrderVegeData}} -->
  <!-- <h3>{{ nyOrderKeysNum }}</h3> -->
  <!-- <h3>{{ OrderTimeList }}</h3> -->
   <article class="myorder_card" v-if="props.currentUser!=null">
    <div class="title_order">
      <h2>過去の注文</h2>
      <p v-on:click="onPushAllview">全て見る</p>
    </div>
    
    <article class="myorder_elementgroup">
      <div v-for="(element,uniqueKey) in  AllOrderData[props.currentUser.uid]" :key="uniqueKey">
        <MyOrderElements
          v-bind:data="element"
          v-bind:unique="uniqueKey"
          ></MyOrderElements>
      </div>
    </article>
   </article>
</template>
<style>
h2{
  margin-bottom: 0;
}
.myorder_card{
  width: 340px;
  height: 250px;
  border: none;
  background-color: white;
  border-radius: 5px;
  margin :20px auto;
  padding: 5px 20px;
}
.title_order{
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--text-color);
  align-items: center;
  height: 40px;
}
.title_order p{
  color: blue;
  margin: 0;
}

.myorder_elementgroup{
  overflow-y: scroll;
  height: 200px;
}
</style>
