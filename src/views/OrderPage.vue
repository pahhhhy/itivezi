<script setup lang="ts">
import { useVegeStore } from '@/stores/vege'
import { ref,watch} from 'vue'
import OrderHistory from './components/orderpage/OrderHistory.vue';
import { useOrderDataStore } from '@/stores/orderData';
import OrderFormPage from './components/orderpage/OrderFormPage.vue';
import OrderEachToggle from './components/orderpage/OrderEachToggle.vue';
import { useCartStore } from '@/stores/cart';
import router from '@/router'
interface CartTables{
    [uid:string]:{
         [uniqueKey: string]:CartElementTables;
        
    }
}
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
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:string
            uid:string
            unit:string
            photo:string
        }
    }
}
const orderStore=useOrderDataStore()
const vegeStore=useVegeStore()
const orderData=ref<Vegetables>(orderStore.orderData)
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const cartStore=useCartStore()
const cartData=ref<CartTables>(cartStore.cartData)
vegeAllData.value=filterAvailableVegetables(vegeAllData.value)
watch(() => cartStore.cartData, (newUser) => {
  cartData.value = newUser;
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = filterAvailableVegetables(newUser);
  
});
watch(() => orderStore.orderData, (newUser) => {
  orderData.value = newUser;
});
function filterAvailableVegetables(data: Vegetables): Vegetables {
    const result: Vegetables = {};
    for (const vegeName in data) {
        const filteredEntries: { [uniqueKey: string]: any } = {};
        for (const uniqueKey in data[vegeName]) {
            if (data[vegeName][uniqueKey].state === "Available") {
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
</script>
<template>
  <OrderHistory></OrderHistory>
<h1>注文画面</h1>
<button class="btn btn-success" v-on:click="onPushCart"> カートへ</button>
<!-- {{ vegeAllData }} -->
  <!-- {{ orderData }}
  <p>{{cartData}}</p> -->
  <article v-if="Object.keys(orderData).length===0">
    <div v-for="(data,vegeName) in vegeAllData" :key=vegeName>
      <!-- {{ data }}
      <p>{{vegeName}}</p> -->
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

</style>