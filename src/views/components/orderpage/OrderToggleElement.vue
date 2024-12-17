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
const vegeCount=ref<number>(1)
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
        isPopup.value=false
    }
}
function OnpushElement(){
  isPopup.value=!isPopup.value
  totalMoney.value = vegeCount.value* props.data.en
}
function onPushBuck(){
  isPopup.value=false
}
function changeNumber(isplus:boolean,money: number){
  if(isplus){
    vegeCount.value=vegeCount.value+1
  }else{
    vegeCount.value=vegeCount.value-1
  }
  totalMoney.value = vegeCount.value* money
}
</script>
<template>
<!-- <h4>{{props.data}}</h4>
<p>{{props.uniqueKey}}</p> -->

  <button class="card" style="width: 18rem;" v-on:click="OnpushElement">
    <img :src="props.data.photo" class="card-img-top" alt="..." v-if="props.data.photo!='none'">
    <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.data.photo=='none'">
    <div class="card-body">
        <p class="card-title">【{{props.data.farmer}}産】</p>
        <div class="card_money">
          <h5 class="card-text">{{props.data.unit}}  </h5>
          <h4 class="card-text">  {{props.data.en}}円</h4>
        </div>
    </div>
  </button>
<article class="popup_order" v-if="isPopup">
  
  <h1>{{props.vegeName}}</h1>
  <p v-for="(Wholesaler,index) in props.data.roadStation" v-bind:key="index" class="Wholesaler">
    
    【{{ Wholesaler }}】
  </p>
  <h4>{{props.data.unit}}     {{props.data.en}}円</h4>
  <label>個数選択</label>
  <div class="selectnumber">
    <button class="backbutton" v-if="vegeCount!=1" >

      <i class="bi bi-dash-lg"  v-on:click="changeNumber(false,props.data.en)"></i>
    </button>
    <p class="Quantity">{{vegeCount}}</p>
    <button class="plusbutton" v-on:click="changeNumber(true,props.data.en)">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
    <p>小計      ￥{{totalMoney}}</p>
    <button class="btn btn-success" v-on:click="onPushBuck()">戻る</button>
    <button class="btn btn-success" v-on:click="onPushCart()" v-bind:class="{disable:totalMoney==0}">カートに入れる</button>

</article >
<div class="blackback" v-if="isPopup"></div>
</template>
<style scoped>
p{
  margin: 0;
}
.disable{
    pointer-events: none;
    opacity: 0.5;
}
.selectnumber{
  display: flex;
  width: 100px;
    justify-content: end;
  height: 30px;
}
.backbutton{
  background-color: var(--line-color);
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border:none;
}
.plusbutton{
  background-color: var(--line-color);
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border:none;
}
.Quantity{
  padding: 0 5px;
  margin: 0!important;
  width: 30px;
}
.card-body{
  text-align: left;
  width: 100%;
  padding: 0;
}
.card_money{
  display: flex;
  flex-direction: column;
}
.card-body h5{
  font-size: 20px;
  font-weight: bolder;
  padding: 0;
  text-align: left;
  color: var(--other-color);
}
.card_money h5{
  font-size: 14px;
  font-weight: normal;
  margin: 0;
}

.card img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.card-body p{
  font-size: 14px;
  text-align: left;
  border-radius: 10px;
  display: inline-block;
  text-align: center;
  border: 2px solid var(--main-color);
}
.card{
  margin:  10px 0;
  width: 150px!important;
  height: 150px;
  border: none;
  background-color: white;
}
.blackback{
  position: fixed ;
  height: calc(100vh - 60px);
  width: 100vw;
  top: 60px;
  left: 0;
  z-index: 5;
  background-color: rgba(3,3,3,0.5);;
}
.card img{
  height: 50%;
}
.popup_order{
  position: fixed;
  width: 512px;
  z-index: 10;
  border: 1px solid gray;
  border-radius: 20px;
  top: calc(50% - 150px);
  left: calc(50% - 256px);
  padding: 20px;
  background-color: white;
}
.popup_order label{
  font-weight: bolder;
}
.popup_order h1{
  border-bottom: 1px solid var(--text-color);
  font-size: 36px;
  font-weight: bolder;
}
.popup_order h4{
  color: var(--other-color);
}
.popup_order label{
  font-size: 18px;
}
.Wholesaler {
  font-size: 20px!important;
  text-align: left;
  border-radius: 10px;
  display: inline-block;
  padding: 3px;
  text-align: center;
  border: 2px solid var(--main-color);
}
.popup_order p{
  margin: 10px 0;
  font-size: 24px;
  font-weight: bolder;
}
.popup_order button{
  font-size: 16px;
  margin: 0 5px;
  font-weight: bolder;
}
@media (max-width: 575.98px) { 
  .popup_order{
    width: 340px;
    left: calc(50% - 170px);
  }
  .popup_order h1{
    font-size: 24px;
  }
  .Wholesaler{
    font-size: 14px!important;
  }
  .popup_order p{
    margin: 5px 0;
    font-size: 18px;
    font-weight: bolder;
  }
  .popup_order label{
    font-size: 14px;
  }
}
</style>