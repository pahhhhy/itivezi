<script setup lang="ts">
import { ref,watch} from 'vue'
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/userData';
import { useOrderDataStore } from '@/stores/orderData';
const OrderDataStore=useOrderDataStore()
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
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
interface Datatables{
    en:number;
    farmer:string
    roadStation:string
    state:string
    uid:string
    unit:string
    photo:string
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
interface Props {
  orderData: Vegetables
}
const props = defineProps<Props>()
const VegeName=ref<string>(Object.keys(props.orderData)[0])
const vegeCount=ref<number>(0)
const totalMoney=ref<number>(0)
const error=ref<boolean>(false)
const CartStore=ref(useCartStore())
const uniqueKey=ref<string>(Object.keys(props.orderData[VegeName.value])[0])
const orderDataElement=ref<Datatables>(props.orderData[VegeName.value][uniqueKey.value])
    function changeMoney(money: number) {
  // マイナスの値になることを防ぐ
  if (vegeCount.value< 0) {
      vegeCount.value = 0
    } 
  totalMoney.value = vegeCount.value* money
}
async function onPushCart(){
    if(totalMoney.value==0){
        error.value=true
    }else{
        error.value=false
        let Cartdata:CartElementTables={
          en:orderDataElement.value.en,
          farmer:orderDataElement.value.farmer,
          roadStation:orderDataElement.value.roadStation,
          unit:orderDataElement.value.unit,
          photo:orderDataElement.value.photo,
          vegeName:VegeName.value,
          unique:uniqueKey.value,
          amount:vegeCount.value,
        }
        if(currentUser.value)
        await CartStore.value.updateCartData(Cartdata,currentUser.value.uid)
        CartStore.value.roadData()
        OrderDataStore.resetData()
        
    }
}
</script>
<template>
<h1>商品詳細</h1>
<!-- {{ props.orderData }} -->
<h3>{{VegeName}}</h3>
<p>販売単位:{{orderDataElement.unit}}</p>
<p>値段:{{ orderDataElement.en }}円</p>
<p>卸先:{{orderDataElement.roadStation}}</p>

<h4>何個買いますか？</h4>
<input
        class="form-control"
        type="number"
        placeholder="何組買いますか？"
        aria-label="default input example"
        v-model="vegeCount"
        @change="
          changeMoney(orderDataElement.en)
        "
        />

<h3>合計金額：{{totalMoney}}円</h3>

    <h1 style="color: red" v-show="error &&  totalMoney">全ての項目を入力してください</h1>
<button class="btn btn-success" v-on:click="onPushCart()">カートに入れる</button>
</template>
<style scoped>

</style>