<script setup lang="ts">
import { ref,watch} from 'vue'
import { useRoute } from 'vue-router';
import { useFireOrderStore } from '@/stores/fireOrder';
import { useUserStore } from '@/stores/userData';
import { useVegeStore } from '@/stores/vege'
import { useCartStore } from '@/stores/cart';
import { useOrderDataStore } from '@/stores/orderData';
import router from '@/router'
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:vegeElementTables
    }
}
interface vegeElementTables{
  en:number
  farmer:string
  roadStation:string[]
  state:VegeState
  uid:string
  unit:string
  photo:string
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
place:string
}
interface orderVegeElementTables{
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
const fireOrderStore=useFireOrderStore()
const orderAllData = ref<Ordertables>(fireOrderStore.OrderAllData)
const route = useRoute();
const unique = ref<string|string[]>(route.params.unique);
const data=ref<OrdertablesElement>()
const vegeData=ref<orderVegeElementTables>()
const orderTime=ref<string>("")
const selectDate=ref<string>("")
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const canBuy=ref<boolean>(false)
  const OrderDataStore=useOrderDataStore()
  const cartStore=useCartStore()
function initData(){
    if(typeof(unique.value)=="string"&&currentUser.value){
    data.value=orderAllData.value[currentUser.value.uid][unique.value]
    vegeData.value=getNumData(data.value)
    orderTime.value=formatDate(data.value.orderTime)
    selectDate.value=formatDate(data.value.selectData)
    getCanBuy()
    }
    
}
initData()
function getNumData(orderTable: OrdertablesElement) {
  // 数値キーに対応する部分を取り出す
  const numData = Object.keys(orderTable)
    .filter((key) => !isNaN(Number(key))) // 数値のキーのみを抽出
    .map((key) => orderTable[Number(key)]); // 数値のキーに対応するデータを取得

  return numData;
}
//StateがDiscontinuedが無いことを確認
function getCanBuy(){
    canBuy.value=true
    if(vegeData.value)
    for(let i:number=0;i<Object.keys(vegeData.value).length;i++){
        if(!isAvailableState(vegeAllData.value,vegeData.value[i].VegeName,vegeData.value[i].unique)){
            canBuy.value=false
        }
    }
}
getCanBuy()
function isAvailableState(vegetables: Vegetables, vegeName: string, uniqueKey: string): boolean {
  // 指定された vegeName と uniqueKey が存在するか確認
  if (vegetables[vegeName] && vegetables[vegeName][uniqueKey]) {
    // state が "Available" かを判定
    return vegetables[vegeName][uniqueKey].state === VegeState.Available;
  }
  return false; // 存在しない場合や "Available" でない場合は false
}
function formatDate(input:string) {
  // 入力をスプリットして配列に変換
  const [year, month, day] = input.split('-');
  // フォーマットを `YYYY/MM/DD` に変換
  return `${year}年${month}月${day}日`;
}
async function onPushCart(){
  if(vegeData.value)
  for(let i:number=0;i<Object.keys(vegeData.value).length;i++){
    let Cartdata:CartElementTables={
    en:vegeData.value[i].en,
    farmer:vegeData.value[i].farmer,
    roadStation:vegeData.value[i].roadStation,
    unit:vegeData.value[i].unit,
    photo:vegeData.value[i].photo,
    vegeName:vegeData.value[i].VegeName,
    unique:vegeData.value[i].unique,
    amount:vegeData.value[i].amount,
  }
  if(currentUser.value)
  await cartStore.updateCartData(Cartdata,currentUser.value.uid)
  }
cartStore.roadData()
OrderDataStore.resetData()
router.push("/cart")
}
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => fireOrderStore.OrderAllData, (newUser) => {
  orderAllData.value = newUser;
  initData()
}); 
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
});
function onPushBack(){
  router.back();
}
</script>
<template>
    <article class="myorderelement_card">
      <div class="title_order">
        <i class="bi bi-chevron-left" v-on:click="onPushBack"></i>
        <h2>注文内容の確認</h2>
    </div>
        <div class="orderinfo">
          <div class="orderinfoelement"><h5>注文日</h5><p>{{orderTime}}</p></div>
          <div class="orderinfoelement"><h5>配送希望日</h5><p>{{selectDate}}</p></div>
          <div class="orderinfoelement"><h5>小計</h5><p>￥{{data?.totalMoney}}</p></div>
          <div class="orderinfoelement"><h5>届け先</h5><p>{{data?.place}}</p></div>
        </div>
        <button v-if="canBuy" v-on:click="onPushCart">再購入</button>
        <p class="error" v-if="!canBuy">注文した商品が売り切れているため再購入できません。</p>
        <h3>購入物品</h3>
        <div v-for="(Data,index) in vegeData" v-bind:key="index">
          <article class="buyitem_card">
            <div class="img_name">
              <div class="cart_img">
                <img :src="Data.photo" class="card-img-top" alt="..." v-if="Data.photo!='none'">
                <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="Data.photo=='none'">
              </div>
              <div class="vegeinfo">
                <p>【{{Data.farmer}}産】</p>
                <h2>{{Data.VegeName}}</h2>
              </div>
            </div>
            
            <p v-for="(Wholesaler,index) in Data.roadStation" v-bind:key="index" class="Wholesaler">
              【{{ Wholesaler }}】
            </p>
            <div class="select_money">
              <div class="selectnumber">
              </div>
              <div class="price">
                <p class="unit">{{Data.unit}}</p>
                <p class="money">￥{{Data.en}}</p>
              </div>
            </div>
            
          </article>
        </div>
    </article>
</template>
<style scoped>
p{
  margin: 0;
}
.title_order{
  display: flex;
  justify-content: flex-start;
}
.title_order i{
  font-size: 24px;
  padding: 0 5px;
}
.myorderelement_card{
  width: 340px;
  background-color: white;
  margin: 0 auto;
  border-radius: 5px;
}
.myorderelement_card h2{
  border-bottom: 1px solid var(--line-color);
  margin: 20px;
}
.myorderelement_card h3{
  border-bottom: 1px solid var(--line-color);
  margin: 20px;
}
.error{
  margin: 0 30px;
  color: red;
  font-size: 18px;
  font-weight: bold;
}
.myorderelement_card button{
  background-color: var(--main-color);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 20px;
  margin: 0 100px;
  font-weight: bolder;
  border: none;
  margin-top: 10px;
}
.orderinfoelement{
  display: flex;
}
.orderinfoelement h5{
  font-size: 18px;
  width: 120px;
  font-weight: normal;
}
.orderinfo{
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  border: 1px solid var(--line-color);
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
  height: 135px;
  padding: 5px;
  background-color: white;
  margin: 0 auto;
  border-radius: 5px;
  border-top: 1px solid var(--line-color);
  border-bottom: 1px solid var(--line-color);
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
    border: none;
    margin: 0;
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
    width: 100%;
    justify-content: space-around;
    font-size: 20px;
    color: var(--other-color);
    font-weight: bolder;
  }
</style>