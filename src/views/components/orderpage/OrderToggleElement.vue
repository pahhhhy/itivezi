<script setup lang="ts">
import { ref,watch} from 'vue'
import { useUserStore } from '@/stores/userData';
import { useCartStore } from '@/stores/cart';
import { useOrderDataStore } from '@/stores/orderData';
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface datatables{
    en:number;
    farmer:string
    roadStation:string[]
    state:VegeState
    uid:string
    unit:string
    photo:string
}
interface Props {
  data:datatables
  uniqueKey:string|number
  vegeName:string|number
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

interface Emits {
  (event: 'onPushPopup'): void
}
const emit = defineEmits<Emits>()
const OrderDataStore=useOrderDataStore()
const props = defineProps<Props>()
const vegeCount=ref<number>(0)
const totalMoney=ref<number>(0)
const error=ref<boolean>(false)
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const CartStore=ref(useCartStore())
const isPopup=ref<boolean>(false)
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
    async function onPushCart(){
    if(totalMoney.value==0||typeof props.uniqueKey=="number"||typeof props.vegeName=="number"){
        error.value=true
    }else{
        error.value=false
        let Cartdata:CartElementTables={
          en:props.data.en,
          farmer:props.data.farmer,
          roadStation:props.data.roadStation,
          unit:props.data.unit,
          photo:props.data.photo,
          vegeName:props.vegeName,
          unique:props.uniqueKey,
          amount:vegeCount.value,
        }
        if(currentUser.value)
        await CartStore.value.updateCartData(Cartdata,currentUser.value.uid)
        CartStore.value.roadData()
        OrderDataStore.resetData()
        vegeCount.value=0
        totalMoney.value=0
        emit("onPushPopup")
    }
}
function changeMoney(money: number) {
  // マイナスの値になることを防ぐ
  if (vegeCount.value< 0) {
      vegeCount.value = 0
    } 
  totalMoney.value = vegeCount.value* money
}
function OnpushElement(){
  isPopup.value=!isPopup.value
}
function onPushBuck(){
  isPopup.value=false
}
</script>
<template>
<!-- <h4>{{props.data}}</h4>
<p>{{props.uniqueKey}}</p> -->

  <button class="card" style="width: 18rem;" v-on:click="OnpushElement">
    <img :src="props.data.photo" class="card-img-top" alt="..." v-if="props.data.photo!='none'">
    <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.data.photo=='none'">
    <div class="card-body">
        <p class="card-title">{{props.data.farmer}}</p>
        <div class="card_money">
          <h5 class="card-text">{{props.data.unit}}  </h5>
          <h5 class="card-text">  {{props.data.en}}円</h5>
        </div>
    </div>
  </button>
<article class="popup_order" v-if="isPopup">
  <h1>{{props.vegeName}}</h1>
  <p>卸先： {{props.data.roadStation}}</p>
  <h4>{{props.data.unit}}     {{props.data.en}}円</h4>
   <input
        class="form-control"
        type="number"
        placeholder="何組買いますか？"
        aria-label="default input example"
        v-model="vegeCount"
        @change="
          changeMoney(props.data.en)
        "
        />
    <p>合計金額：{{totalMoney}}円</p>
    <button class="btn btn-success" v-on:click="onPushBuck()">戻る</button>
    <button class="btn btn-success" v-on:click="onPushCart()" v-bind:class="{disable:totalMoney==0}">購入</button>
</article>
</template>
<style scoped>
.disable{
    pointer-events: none;
    opacity: 0.5;
}
.card-body{
  margin-top: 5px;
  padding: 0 10px;
  width: 100%;
}
.card_money{
  display: flex;
  justify-content: space-between;
  
}
.card-body h5{
  font-size: 18px;
  text-align: right;
  color: var(--other-color);
}
.card img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.card-body p{
  font-size: 16px;
  border-radius: 8px;
  margin: 0;
  width: 60px;
  text-align: center;
  border: 2px solid var(--main-color);
}
.card{
  margin: 10px;
  width: 150px!important;
  height: 150px;
  border: none;
  background-color: white;
}
.card img{
  height: 50%;
}
.popup_order{
  position: fixed;
  width: 400px;
  height: 300px;
  z-index: 1;
  border: 1px solid gray;
  border-radius: 20px;
  top: 20%;
  left: 20%;
  padding: 20px;
  background-color: white;
}
</style>