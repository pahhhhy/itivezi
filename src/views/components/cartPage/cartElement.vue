<script setup lang="ts">
import { ref,watch} from 'vue'
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/userData';
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
interface Props {
  data:CartElementTables
  uniqueKey:string|number
}
interface Emits {
  (event: 'getTotalMoney', totalMoney: number): void
  (event: 'deleteData', unique: string|number): void
}

const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
  const vegeamount=ref<number>(props.data.amount)
const totalMoney=ref<number>(props.data.en*vegeamount.value)
  const cartStore=useCartStore()
emit("getTotalMoney",totalMoney.value)
function deleteData(){
  emit("deleteData",props.uniqueKey)
}
function changeNumber(isplus:boolean){
  let DiffNum:number
  let updateCartData:CartElementTables =props.data
  if(isplus){
    vegeamount.value += 1
    DiffNum=props.data.en*1
  }else{
    vegeamount.value -= 1
    DiffNum=props.data.en*-1
  }
  totalMoney.value=props.data.en*vegeamount.value
  updateCartData.amount=vegeamount.value
  if(typeof(props.uniqueKey)=="string"&&currentUser.value)
  cartStore.SetCartData(updateCartData,currentUser.value.uid,props.uniqueKey)
  emit("getTotalMoney",DiffNum)
}
</script>
<template>
  <article class="buyitem_card">
    <div class="img_name">
      <div class="cart_img">
        <img :src="props.data.photo" class="card-img-top" alt="..." v-if="props.data.photo!='none'">
        <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.data.photo=='none'">
      </div>
      <div class="vegeinfo">
        <p>【{{props.data.farmer}}産】</p>
        <h2>{{props.data.vegeName}}</h2>
      </div>
    </div>
    
    <p v-for="(Wholesaler,index) in props.data.roadStation" v-bind:key="index" class="Wholesaler">
      【{{ Wholesaler }}】
    </p>
    <div class="select_money">
      <div class="selectnumber">
        <button class="backbutton">
          <i class="bi bi-trash3" v-if="vegeamount==1" v-on:click="deleteData"></i>
          <i class="bi bi-dash-lg"  v-if="vegeamount!=1" v-on:click="changeNumber(false)"></i>
        </button>
        <p class="Quantity">{{vegeamount}}</p>
        <button class="plusbutton" v-on:click="changeNumber(true)">
          <i class="bi bi-plus-lg"></i>
        </button>
      </div>
      <div class="price">
        <p class="unit">{{props.data.unit}}</p>
        <p class="money">￥{{props.data.en}}</p>
      </div>
    </div>
    
  </article>
</template>
<style scoped>
p{
  margin: 0;
}
.img_name{
  width: 100%;
  height: 65px;
  display: flex;
}
.cart_img{
  height: 65px;
  width: 140px;
}
.cart_img img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.buyitem_card{
  width: 340px;
  height: 150px;
  padding: 10px;
  background-color: white;
  margin: 0 auto;
  border-radius: 5px;

  }
  .Wholesaler {
    font-size: 14px!important;
    text-align: left;
    border-radius: 10px;
    display: inline-block;
    padding: 3px;
    text-align: center;
    border: 2px solid var(--main-color);
  }
  .vegeinfo p{
    font-size: 14px!important;
    text-align: left;
    border-radius: 10px;
    display: inline-block;
    padding: 3px;
    text-align: center;
    border: 2px solid var(--main-color);
  }
  .vegeinfo h2{
    font-size: 24px;
  }
  .select_money{
    display: flex;
    width: 100%;
    height: 30px;
  }
  .selectnumber{
    display: flex;
    width: 40%;
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
    border: 1px solid var(--line-color);
  }
  .price{
    display: flex;
    width: 60%;
    justify-content: space-around;
    font-size: 20px;
    color: var(--main-color);
    font-weight: bolder;
  }
</style>