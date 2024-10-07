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
</script>
<template>
<!-- <h4>{{props.data}}</h4>
<p>{{props.uniqueKey}}</p> -->

  <div class="card" style="width: 18rem;">
    <img :src="props.data.photo" class="card-img-top" alt="..." v-if="props.data.photo!='none'">
    <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.data.photo=='none'">
    <div class="card-body">
        <h5 class="card-title">{{props.data.farmer}}</h5>
      <p class="card-text">値段:{{props.data.en}}</p>
      <p class="card-text">単価:{{props.data.unit}}</p>
      <p class="card-text">卸先:{{props.data.roadStation}}</p>
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
    <button class="btn btn-success" v-on:click="onPushCart()" v-bind:class="{disable:totalMoney==0}">購入</button>
    </div>
  </div>

</template>
<style scoped>
.disable{
    pointer-events: none;
    opacity: 0.5;
}
    .card{
        margin: 10px;
        width: 280px;
        height: 500px;
    }
    .card img{
        height: 40%;
    }
</style>