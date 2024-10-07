<script setup lang="ts">
import { useVegeStore } from '@/stores/vege'
import { ref,watch} from 'vue'
import OrderHistory from './components/orderpage/OrderHistory.vue';
import { useOrderDataStore } from '@/stores/orderData';
import OrderEachToggle from './components/orderpage/OrderEachToggle.vue';
import { useCartStore } from '@/stores/cart';
import { useSortVegeStore } from '@/stores/sortByVege';
import router from '@/router'
enum SortMode{
    All="all",
    Kawasaki="川崎",
    Murone="室根",
    Other="その他"
}
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface CartTables{
    [uid:string]:{
         [uniqueKey: string]:CartElementTables;
        
    }
}
interface CartElementTables{
    en:number;
    farmer:string
    roadStation:string[]
    unit:string
    photo:string
    unique:string
    vegeName:string
    amount:number
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string[]
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
    }
}
const orderStore=useOrderDataStore()
const vegeStore=useVegeStore()
const sortVegeStore=useSortVegeStore()
const sortVegeOrder=ref<string[]>(sortVegeStore.sortbyVege)
const orderData=ref<Vegetables>(orderStore.orderData)
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const cartStore=useCartStore()
const cartData=ref<CartTables>(cartStore.cartData)
const selectedFilter=ref<SortMode>(SortMode.All)

vegeAllData.value=filterAvailableVegetables(vegeAllData.value)
const filterVegeData=ref<Vegetables>(vegeAllData.value)
watch(() => sortVegeStore.sortbyVege, (newUser) => {
  sortVegeOrder.value = newUser;
});
watch(() => cartStore.cartData, (newUser) => {
  cartData.value = newUser;
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = filterAvailableVegetables(newUser);
  filterVegeData.value=vegeAllData.value
});
watch(() => orderStore.orderData, (newUser) => {
  orderData.value = newUser;
});
function filterAvailableVegetables(data: Vegetables): Vegetables {
    const result: Vegetables = {};
    for (const vegeName in data) {
        const filteredEntries: { [uniqueKey: string]: any } = {};
        for (const uniqueKey in data[vegeName]) {
            if (data[vegeName][uniqueKey].state === VegeState.Available) {
                filteredEntries[uniqueKey] = data[vegeName][uniqueKey];
            }
        }
        // もしfilteredEntriesに要素があれば、resultに追加
        if (Object.keys(filteredEntries).length > 0) {
            result[vegeName] = filteredEntries;
        }
    }
    return result;
}
function onPushCart(){
  router.push("/cart")
}
async function onPushfilter(mode:SortMode){
  selectedFilter.value=mode
  if(mode==SortMode.All){
    filterVegeData.value=vegeAllData.value
  }else{
    filterVegeData.value=filterByRoadStation(vegeAllData.value,mode)
  }
  if(mode==SortMode.Other){
    sortVegeOrder.value= Object.keys(filterVegeData.value)
  }
  else{
    sortVegeOrder.value= await sortVegeStore.roadData(mode) as string[]
  }
  

}
function filterByRoadStation(vegetables: Vegetables, role: SortMode) {
    const result: Vegetables = {};
    
    for (const vegeName in vegetables) {
        const filteredEntries = Object.entries(vegetables[vegeName]).filter(
            ([uniqueKey, data]) => data.roadStation.includes(role)
        );

        if (filteredEntries.length > 0) {
            result[vegeName] = Object.fromEntries(filteredEntries);
        }
    }

    return result;
}
</script>
<template>
  <OrderHistory></OrderHistory>
<h1>注文画面</h1>
<button class="btn btn-success" v-on:click="onPushCart"> カートへ</button>

<!-- {{ vegeAllData }}
<p></p>
<p>{{filterVegeData}}</p> -->
  <!-- {{ orderData }}
  <p>{{cartData}}</p> -->
  <article v-if="Object.keys(orderData).length===0">
    <h3>フィルター</h3>
<button v-on:click="onPushfilter(SortMode.All)" class="filter_button" v-bind:class="{fliter_active:selectedFilter==SortMode.All}">全て</button>
<button v-on:click="onPushfilter(SortMode.Kawasaki)" class="filter_button" v-bind:class="{fliter_active:selectedFilter==SortMode.Kawasaki}">川崎</button>
<button v-on:click="onPushfilter(SortMode.Murone)" class="filter_button" v-bind:class="{fliter_active:selectedFilter==SortMode.Murone}">室根</button>
<button v-on:click="onPushfilter(SortMode.Other)" class="filter_button" v-bind:class="{fliter_active:selectedFilter==SortMode.Other}">その他</button>
    <div v-for="(data,vegeName,index) in filterVegeData" :key=vegeName>
      <!-- {{ data }}
      <p>{{vegeName}}</p> -->
    <OrderEachToggle
    v-bind:data="data"
    v-bind:vege-name="sortVegeOrder[index]"></OrderEachToggle>
  </div>
  </article>
  <article v-if="Object.keys(orderData).length!==0">
    <OrderFormPage
    v-bind:order-data="orderData"></OrderFormPage>
  </article>
</template>
<style scoped>

.filter_button{
  background-color: white;
  padding: 10px;
}
.fliter_active{
  background-color: rgb(209, 209, 209);
}
</style>