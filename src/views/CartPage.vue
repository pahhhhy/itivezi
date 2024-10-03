<script setup lang="ts">
import { ref,watch} from 'vue'
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/userData';
import { useFireOrderStore } from '@/stores/fireOrder';
import cartElement from './components/cartPage/cartElement.vue';
import router from '@/router'
enum State{
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
    roadStation:string
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
    roadStation:string
    state:State
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
  state:string
  totalMoney:number
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
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => cartStore.cartData, (newUser) => {
  cartData.value = newUser;
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
        state: State.Available, // state を追加
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
            state: "未連絡",
            totalMoney: AllTotalMoney.value
        };
        addCartToOrder(cartData.value,currentUser.value.uid,uproadData)
        isPopup.value= await FireOrderStore.updateCartData(uproadData,currentUser.value.uid)
    }
    
}
function onPushBack(){
    isPopup.value=false
    if(currentUser.value)
     cartStore.resetCartData(currentUser.value.uid)
    cartStore.roadData()
    router.push("/order")
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
function deleteData(unique:string|number){
  if(currentUser.value &&typeof unique=="string"){
    delete cartData.value[currentUser.value.uid][unique]
    cartStore.deleteCartData(currentUser.value.uid,unique)
  }
  
}
</script>
<template>
<h1>購入画面</h1>
<!-- {{ cartData }} -->
<table v-if="currentUser">
    <tbody>
        <tr>
            <th>商品詳細</th>
            <th>販売単位</th>
            <th>購入個数</th>
            <th>合計金額</th>
            <th>削除</th>
        </tr>
        <tr v-for="(element,uniqueKey) in cartData[currentUser.uid]" :key="uniqueKey">
            <cartElement 
            v-bind:data="element"
            v-bind:unique-key="uniqueKey"
            v-on:get-total-money="getTotalMoney"
            v-on:delete-data="deleteData"></cartElement>
        </tr>
    </tbody>
    <h1>日付指定：{{ selectDate }}</h1>
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

    <h2>総合金額:{{AllTotalMoney}}円</h2>
    <button class="btn btn-success" v-on:click="onPushBuy()">購入</button>
    <article class="cart_popup" v-show="isPopup">
        <h3>購入しました</h3>
        <button v-on:click="onPushBack()">買い物に戻る</button>
    </article>
</table>
</template>
<style scoped>
.cart_popup{
  position: fixed;
  top: 30%;
  left: 30%;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 10px;
}
</style>