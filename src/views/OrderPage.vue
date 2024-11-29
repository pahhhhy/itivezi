<script setup lang="ts">
import { useVegeStore } from '@/stores/vege'
import { ref,watch,onMounted} from 'vue'
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
const isfliter=ref<boolean>(false)
  const roles = ref<SortMode[]>(Object.values(SortMode).filter((item): item is SortMode => item !== SortMode.All));
  onMounted(() => {
    sortVegeOrder.value=sortVegeStore.sortbyVege
    vegeAllData.value=vegeStore.VegeAllData
    vegeAllData.value = filterAvailableVegetables(vegeAllData.value);
    filterVegeData.value=vegeAllData.value
    filterVegeData.value=makeSortData(filterVegeData.value,sortVegeOrder.value)
})
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
  filterVegeData.value=makeSortData(filterVegeData.value,sortVegeOrder.value)
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
  switch(selectedFilter.value){
    case SortMode.Kawasaki:
      filterVegeData.value=filterByRoadStation(vegeAllData.value,selectedFilter.value)
      await sortVegeStore.roadData(selectedFilter.value)
      filterVegeData.value=makeSortData(filterVegeData.value,sortVegeOrder.value)
      sortVegeOrder.value= await sortVegeStore.roadData(selectedFilter.value) as string[]
      break;
    case SortMode.Murone:
      filterVegeData.value=filterByRoadStation(vegeAllData.value,selectedFilter.value)
      await sortVegeStore.roadData(selectedFilter.value)
      filterVegeData.value=makeSortData(filterVegeData.value,sortVegeOrder.value)
      sortVegeOrder.value= await sortVegeStore.roadData(selectedFilter.value) as string[]
      break;
    case SortMode.Other:
      filterVegeData.value=filterByRoadStation(vegeAllData.value,selectedFilter.value)
      await sortVegeStore.roadData(selectedFilter.value)
      filterVegeData.value=makeSortData(filterVegeData.value,sortVegeOrder.value)
      sortVegeOrder.value= Object.keys(filterVegeData.value)
    break
    default://全ての時
      filterVegeData.value=vegeAllData.value
      await sortVegeStore.roadData(selectedFilter.value)
      filterVegeData.value=makeSortData(filterVegeData.value,sortVegeOrder.value)
      sortVegeOrder.value= await sortVegeStore.roadData(selectedFilter.value) as string[]
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
function makeSortData(data: Vegetables, order: string[]): Vegetables {
  // 指定された順番で並べ替え、他の野菜を最後に追加
  const sortedData = Object.keys(data)
    .sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1) return 1; // orderにない場合は後ろに
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {} as Vegetables);

  return sortedData;
}
function onpushhistory(){
  router.push("/my-allorder")
}
function onpushfilter(){
  isfliter.value=!isfliter.value
}
</script>
<template>
  <article class="module">
    <button v-on:click="onpushfilter">
      フィルター
      <i class="bi bi-chevron-down" v-if="!isfliter"></i>
      <i class="bi bi-chevron-up" v-if="isfliter"></i>
    </button>
    <button v-on:click="onpushhistory">過去の注文</button>
  </article>

  <article v-if="Object.keys(orderData).length===0">
    <article class="filter_group" v-if="isfliter">
      <h4>卸先</h4>
      <div class="filter_button_group">
        <div v-for="(element,index) in roles" v-bind:key="index" class="filter_button">
          <input
            class="form-check-input"
            type="radio"
            :value="element"
            v-model="selectedFilter"
            v-on:click="onPushfilter(element)"
            :id="'flexCheckIndeterminate' + index"
          />
          <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
            {{ element }}
          </label>
        </div>
      </div>
      
    </article>

    <div v-for="(data,vegeName,index) in filterVegeData" :key=index>
    <OrderEachToggle
    v-bind:data="data"
    v-bind:vege-name="vegeName"></OrderEachToggle>
  </div>
  </article>
  <article v-if="Object.keys(orderData).length!==0">
    <OrderFormPage
    v-bind:order-data="orderData"></OrderFormPage>
  </article>

</template>
<style scoped>
.module{
  margin: auto;
  width: 340px;
  height: 60px;
  display: flex;
  align-items: center;
}
.module button{
  height: 40px;
  width: 150px;
  border-radius: 5px;
  color: white;
  text-align: center;
  background-color: var(--other-color);
  border: none;
  margin: 0 10px;
}
.filter_button{
  background-color: white;
  padding: 4px 10px;
}
.fliter_active{
  background-color: rgb(209, 209, 209);
}
.filter_group{
  margin: 0 auto;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  width: 340px;
}
.filter_group h4{
  border-bottom: 1px solid var(--text-color);
  width: 100%;
}
.filter_button_group{
  display: flex;
}
</style>