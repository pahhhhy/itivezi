<script setup lang="ts">
import { ref,watch} from 'vue'
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/userData';
import { useFireOrderStore } from '@/stores/fireOrder';
import cartElement from './components/cartPage/cartElement.vue';
import router from '@/router'
import { usefireUserStore } from '@/stores/fireUserdata';
interface Usertables{
    affiliation:String[]
   
    name:string
    phoneNumber:number
    place:string
    role:Role
    email:string
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
  }

enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
enum OrderStete{
  Completed="取引完了",
  Uncontacted="未連絡",
  contacted="連絡済み",
  cancel="取引取り消し"
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
interface timestamp{
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
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
const today = new Date().toISOString().split('T')[0]
const selectDate=ref<string>("")
const userStore=useUserStore()
const FireOrderStore=useFireOrderStore()
const currentUser = ref(userStore.currentUser);
const cartStore=useCartStore()
const cartData=ref<CartTables>(cartStore.cartData)
const AllTotalMoney=ref<number>(0)
const isPopup=ref<boolean>(false)
const isNone=ref<boolean>(false)
const place=ref<string>("")
const isDay=ref<boolean>(false)
  const fireUseStore=usefireUserStore()
const myUserData=ref<Usertables>(fireUseStore.myUserData)

  if(currentUser.value){
    console.log(cartData.value[currentUser.value.uid])
    if(cartData.value[currentUser.value.uid]==undefined){
    isNone.value=true
  }else{
    isNone.value=false
  }
  }
  watch(() => fireUseStore.myUserData, (newUser) => {
  myUserData.value = newUser;
  place.value=myUserData.value.place
});
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => cartStore.cartData, (newUser) => {
  cartData.value = newUser;
  if(currentUser.value){
    console.log(cartData.value[currentUser.value.uid])
    if(cartData.value[currentUser.value.uid]==undefined){
    isNone.value=true
  }else{
    isNone.value=false
  }
  }
});
watch(selectDate, (newDate) => {
  if (newDate) {
    isday();
  }
});
function getTotalMoney(money:number){
    AllTotalMoney.value = AllTotalMoney.value + money

}

function addCartToOrder(cartData: CartTables, uid: string, order: OrdertablesElement) {
  const userCart = cartData[uid]; // 指定したユーザーのカートデータを取得
  let index = Object.keys(order).length - 5; // 既存の order の数を計算 (-5 は orderTime などの他のプロパティを除外)
  if (userCart) {
    Object.values(userCart).forEach((item) => {
      order[index] = {
        en: item.en,
        farmer: item.farmer,
        roadStation: item.roadStation,
        state: VegeState.Available, // state を追加
        unique: item.unique,
        unit: item.unit,
        photo: item.photo,
        amount: item.amount,
        VegeName: item.vegeName, // vegeName を VegeName にマッピング
      };
      index++;
    });
  }
}

async function onPushBuy(){
    
    if(currentUser.value&&currentUser.value.email&&currentUser.value.displayName){
        let now:timestamp=parseTimestamp(getJSTTimestamp())
        let currentTime:string=now.year + '-' + now.month + '-' + now.day + '-' + now.hours + '-' + now.day + '-' + now.seconds
        let uproadData: OrdertablesElement = {
            orderTime: currentTime,
            email: currentUser.value.email,
            orderName: currentUser.value.displayName,
            selectData: selectDate.value,
            state: OrderStete.Uncontacted,
            totalMoney: AllTotalMoney.value,
            place:place.value
        };
        addCartToOrder(cartData.value,currentUser.value.uid,uproadData)
        if(currentUser.value)
     cartStore.resetCartData(currentUser.value.uid)
    cartStore.roadData()
        isPopup.value= await FireOrderStore.updateCartData(uproadData,currentUser.value.uid)
        console.log(isPopup.value)
    }
    
}
function onPushBack(){
    isPopup.value=false
    
    router.push("/")
}
//タイムスタンプ文字列を変換
function parseTimestamp(timestamp: string) {
  const datePart = timestamp.split('T')[0]
  const timePart = timestamp.split('T')[1].replace('Z', '')

  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds, milliseconds] = timePart.split('-').map(Number)

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds
  }
}
function getJSTTimestamp() {
  const date = new Date()

  // JSTのオフセットはUTC+9時間
  const jstOffset = 9 * 60 * 60 * 1000

  // JSTに変換
  const jstDate = new Date(date.getTime() + jstOffset)

  // ISO 8601フォーマットに変換し、無効な文字を置き換える
  return jstDate.toISOString().replace(/[:.]/g, '-')
}
async function deleteData(unique:string|number){
  if(currentUser.value &&typeof unique=="string"){
    delete cartData.value[currentUser.value.uid][unique]
    cartStore.deleteCartData(currentUser.value.uid,unique)
  }
}
function onPushOrder(){
  router.push("/order")
}
function isday(){
  if(selectDate.value==""){
    isDay.value=false
  }else{
    isDay.value=true
  }
}
</script>
<template>
  <!-- <p>{{cartData}}</p>
  <p>{{isNone}}</p> -->
  <article v-if="currentUser&&!isNone">
    <article class="cart_card">
      <h1>カート</h1>
      <p v-if="cartData[currentUser.uid]!=undefined||cartData[currentUser.uid]!=null">{{Object.keys(cartData[currentUser.uid]).length}}個の商品</p>
      <h2>小計  ￥{{AllTotalMoney}}</h2>
      <div class="selectdate">
        <p>配達希望日</p>
        <VueDatePicker
          v-model="selectDate"
          format="yyyy/MM/dd"
          locale="ja"
          model-type="yyyy-MM-dd"
          week-start="0"
          :enable-time-picker="false"
          :min-date="today"
          auto-apply
          no-today
        />
      </div>
      <div class="selectdate">  
        <p>配達場所</p>
        <input
        class="form-control"
        type="text"
        placeholder="一関市～～～"
        aria-label="default input example"
        v-model="place"
        
        />
      </div>
      <button v-on:click="onPushBuy" v-bind:class="{disable:!isDay}">購入する</button>
      <button v-on:click="onPushOrder" >注文に戻る</button>
    </article>

    
  </article>
  <article class="cart_popup" v-if="isPopup">
    <h2>購入ありがとうございました</h2>
    <p>商品の受け渡しや料金の支払いに関しましては後ほど管理者から連絡が来ます。</p>
    <button v-on:click="onPushBack">ホームに戻る</button>
    
  </article>
  <div class="blackback" v-if="isPopup"></div>
<div v-if="currentUser&&!isNone" class="item_group">
        <div v-for="(element,uniqueKey) in cartData[currentUser.uid]" :key="uniqueKey">
            <cartElement 
            v-bind:data="element"
            v-bind:unique-key="uniqueKey"
            v-on:get-total-money="getTotalMoney"
            v-on:delete-data="deleteData"></cartElement>
</div>
</div>
<article v-if="isNone">
  <article class="cartnone">
    <h2>買い物かごには商品が入っていません。</h2>
    <button class="btn btn-success" v-on:click="onPushOrder()">注文はこちら</button>
  </article>
  
</article>
</template>
<style scoped>
p{
  margin: 0;
}
.disable{
  pointer-events: none;
  opacity: 0.5;
}
.cart_popup{
  position: fixed;
  width: 400px;
  height: 200px;
  z-index: 10;
  border: 1px solid gray;
  border-radius: 20px;
  top: calc(50% - 150px);
  left: calc(50% - 170px);
  padding: 30px;
  background-color: white;
}
.cart_popup button{
  background-color: var(--main-color);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: bolder;
  border: none;
  margin-top: 10px;
}
.cart_popup h2{
  border-bottom: 1px solid var(--text-color);
}
.cart_card p{
  font-size: 20px;
  font-weight: bolder;
}
.cartnone{
  width: 340px;
  background-color: white;
  margin: 20px auto;
  border-radius: 5px;
  padding: 10px;
}
.cartnone h2{
  color: var(--main-color);
}
.cart_card{
  background-color: white;
  padding: 30px;
  border-radius: 5px;
  width: 800px;

  margin: 20px auto;
}
.cart_card h1{
  border-bottom: 1px solid var(--text-color);
  color: var(--text-color);
  font-size: 32px;
  font-weight: bolder;
}
.cart_card h2{
  color: var(--other-color);
}
.selectdate{
  display: flex;
  align-items: center;
}
.selectdate p{
  width: 40%;
}
.cart_card button{
  background-color: var(--main-color);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: bolder;
  border: none;
  margin-top: 10px;
  margin: 10px 10px 0 0;
}
.blackback{
  position: fixed ;
  height: calc(100vh - 80px);
  width: 100vw;
  top: 60px;
  left: 0;
  z-index: 5;
  background-color: rgba(3,3,3,0.5);;
}
.item_group{
  display: flex;
  width: 800px;
  margin: auto;
  flex-direction: row;
  flex-wrap: wrap;
}
@media (max-width: 575.98px) { 
  .cart_card{
    width: 340px;
    padding: 10px;
  }
  .cart_card h1{
    font-size: 20px;
  }
  .cart_card p{
    font-size: 16px;
  }
  .item_group{
    width: 340px;
  }
  .cart_popup{
    width: 340px;
  }
}
</style>