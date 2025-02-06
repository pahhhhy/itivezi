<script setup lang="ts">
import { useVegeStore } from '@/stores/vege'
import { ref,watch,onMounted} from 'vue'
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
    filterVegeData.value=makeSortData(vegeAllData.value,sortVegeOrder.value)
})
vegeAllData.value=filterAvailableVegetables(vegeAllData.value)
const filterVegeData=ref<Vegetables>({})
watch(() => sortVegeStore.sortbyVege, (newUser) => {
  sortVegeOrder.value = newUser;
  filterVegeData.value=makeSortData(vegeAllData.value,sortVegeOrder.value)
});
watch(() => cartStore.cartData, (newUser) => {
  cartData.value = newUser;
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = filterAvailableVegetables(newUser);
  filterVegeData.value=makeSortData(vegeAllData.value,sortVegeOrder.value)
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
  // 野菜の名前リスト
  const vegeNames = Object.keys(data);

  // 指定された順番に基づいてソート
  const sortedNames = vegeNames.sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1) return 1; // orderにないものは後ろ
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // 新しいオブジェクトを作成
  const sortedData: Vegetables = {};
  sortedNames.forEach((vegeName) => {
    sortedData[vegeName] = data[vegeName];
  });

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
  <article v-if="Object.keys(filterVegeData).length==0" style="text-align: center;">
    <div class="three-quarter-spinner"></div>
  </article>
  <article class="module" v-if="Object.keys(filterVegeData).length!=0">
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
@keyframes spin {
  from {
    transform: rotate(0);
  }
  to{
    transform: rotate(359deg);
  }
}
.three-quarter-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--main-color);
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin .5s linear 0s infinite;
}
.module{
  margin: auto;
  width: 800px;
  height: 100px;
  display: flex;
  align-items: center;
}
.module button{
  height: 50px;
  width: 200px;
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
  width: 800px;
}
.filter_group h4{
  border-bottom: 1px solid var(--text-color);
  width: 100%;
}
.filter_button_group{
  display: flex;
}
.filter_button label{
  font-size: 18px;
}
@media (max-width: 575.98px) { 
  .module{
    width: 340px;
  }
  .module button{
    height: 40px;
    width: 150px;
  }
  .filter_button_group{
    width: 340px;
  }
  .filter_group{
    width: 340px;
  }
}
</style>