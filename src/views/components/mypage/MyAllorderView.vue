<script setup lang="ts">
import { ref,watch} from 'vue'
import { useFireOrderStore } from '@/stores/fireOrder';
import { useUserStore } from '@/stores/userData';
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
}

const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const fireOrderStore=useFireOrderStore()
const orderAllData = ref<Ordertables>(fireOrderStore.OrderAllData)
watch(() => fireOrderStore.OrderAllData, (newUser) => {
  orderAllData.value = newUser;
  orderAllData.value=reverseOrdertables(orderAllData.value)
}); 
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
async function onPushBack(){
    router.back();
}
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
</script>
<template>
    <article class="myAllorder_card" v-if="currentUser!=null">
        <div class="title_order">
            <i class="bi bi-chevron-left" v-on:click="onPushBack"></i>
            <h2>過去の注文</h2>
        </div>
        
        <article class="myallorder_elementgroup">
          <div v-for="(element,uniqueKey) in  orderAllData[currentUser.uid]" :key="uniqueKey">
            <MyOrderElements
              v-bind:data="element"
              v-bind:unique="uniqueKey"
              ></MyOrderElements>
          </div>
        </article>
       </article>
</template>
<style scoped>
.myAllorder_card{
    width: 512px;
    border: none;
    overflow:auto ;
    background-color: white;
    border-radius: 5px;
    margin :20px auto;
    padding: 5px 20px;
  }
  .myorder_card h2{
    border-bottom: 1px solid var(--text-color);
  }
  .title_order{
    display: flex;
    justify-content: flex-start;
  }
  .title_order i{
    font-size: 24px;
    padding: 0 5px;
  }
  .myallorder_elementgroup{
    overflow-y: scroll;
    height: 700px;
  }
  .myallorder_elementgroup::-webkit-scrollbar {
    width:10px;
  }
  .myallorder_elementgroup::-webkit-scrollbar-thumb {
    background: var(--line-color);
    width: 6px;
    height: 6px;
    border-radius: 5px;
  }
  @media (max-width: 575.98px) { 
    .myAllorder_card{
      width: 340px;
    }
    .myallorder_elementgroup{
      height: 600px;
    }
  }
</style>