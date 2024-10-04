<script setup lang="ts">
import { ref ,watch} from 'vue'
import { useFireOrderStore } from '@/stores/fireOrder'
import { useUserStore } from '@/stores/userData';
import { useVegeStore } from '@/stores/vege'
import OrderHistoryElement from './OrderHistoryElement.vue';
import OrderHistoryPopupElement from './OrderHistoryPopupElement.vue';
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
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:vegeElementTables
    }
}
interface vegeElementTables{
  en:number
  farmer:string
  roadStation:string
  state:VegeState
  uid:string
  unit:string
  photo:string
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
    roadStation:string
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
}

interface orderVegeElementTables{
    [num:number]:{
    en:number;
    farmer:string
    roadStation:string
    state:VegeState
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}
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
const FireOrderStore=useFireOrderStore()
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const isActive=ref<boolean>(false)
const OrderAllData=ref<Ordertables>(FireOrderStore.OrderAllData)
OrderAllData.value=reverseOrdertables(OrderAllData.value)
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const IsPopup=ref<boolean>(false)
const selectData=ref<orderVegeElementTables>([])
const nowSelectData = ref< Vegetables>({});
const AllTotalMoney=ref<number>(0);
const selectDate=ref<string>("")
const selectCountList=ref<number[]>([])
  const today = new Date().toISOString().split('T')[0]
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => FireOrderStore.OrderAllData, (newUser) => {
  OrderAllData.value = reverseOrdertables(newUser);
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
});
function onPushHistory(){
    isActive.value=!isActive.value
}
function getSelectData(data:orderVegeElementTables){
  selectData.value=data
  IsPopup.value=true
  for (let i: number = 0; i < Object.keys(selectData.value).length; i++) {
    const vegeName = selectData.value[i].VegeName;
    const uniqueKey = selectData.value[i].unique;
     // vegeNameが存在しない場合は初期化
     if (!nowSelectData.value[vegeName]) {
      nowSelectData.value[vegeName] = {};
    }

    // uniqueKeyを使用してデータを挿入
    nowSelectData.value[vegeName][uniqueKey] = getNowSelectData(vegeAllData.value, vegeName, uniqueKey);
  }
}
function reverseOrdertables(data: Ordertables): Ordertables {
    const result: Ordertables = {};

    for (const uid in data) {
        const reversedEntries: { [uniqueKey: string]: OrdertablesElement } = {};

        // uniqueKey を配列化して逆順に
        const keys = Object.keys(data[uid]).reverse();

        keys.forEach((uniqueKey) => {
            reversedEntries[uniqueKey] = data[uid][uniqueKey];
        });

        result[uid] = reversedEntries;
    }

    return result;
}
function getNowSelectData(data: Vegetables, vegeName: string, uniqueKey: string): vegeElementTables {
  let result: vegeElementTables = {
    en: 0,                    
    farmer: "",                
    roadStation: "",           
    state: VegeState.Discontinued,      
    uid: "",                  
    unit: "",                  
    photo: ""                  
  };

  // 野菜名とユニークキーが存在する場合のみデータを上書き
  if (data[vegeName] && data[vegeName][uniqueKey]) {
    let Data = data[vegeName][uniqueKey];
    result = {
      en: Data.en,                    
      farmer: Data.farmer,                
      roadStation: Data.roadStation,     // 修正: farmer ではなく roadStation
      state: Data.state,      
      uid: Data.uid,                  
      unit: Data.unit,                  
      photo: Data.photo                // 修正: data ではなく Data から取得
    };
  }

  return result;
}
function getTotalMoney(money:number){
  AllTotalMoney.value=AllTotalMoney.value+money
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
            totalMoney: AllTotalMoney.value
        };
        addCartToOrder(nowSelectData.value,uproadData)
        IsPopup.value= !await FireOrderStore.updateCartData(uproadData,currentUser.value.uid)
    }
    
}
function addCartToOrder(selectData: Vegetables,  order: OrdertablesElement) {
  const VegeName=Object.keys(selectData)
  for(let i:number=0;i<VegeName.length;i++){
    const uniqueKey =Object.keys(selectData[VegeName[i]])
    const DataElement=selectData[VegeName[i]][uniqueKey[0]]
    order[i] = {
        en: DataElement.en,
        farmer: DataElement.farmer,
        roadStation: DataElement.roadStation,
        state: VegeState.Available, // state を追加
        unique: uniqueKey[0],
        unit: DataElement.unit,
        photo: DataElement.photo,
        amount: selectCountList.value[i],
        VegeName: VegeName[i], // vegeName を VegeName にマッピング
      };
  }
  }
  function getVegeCount(Count:number,index:number){
    selectCountList.value[index]=Count
  }
</script>
<template>
  <!-- {{OrderAllData}} -->
   <!-- {{dayisTureList }} -->
    <!-- {{ vegeAllData }} -->
      <!-- {{ selectData}} -->
        <!-- {{ nowSelectData }} -->
<button v-on:click="onPushHistory" v-bind:class="{active:isActive}" class="history-button">過去の注文</button>
<article v-if="isActive&& currentUser">
  <!-- {{ OrderAllData[currentUser.uid] }} -->
  <table>
    <caption>過去の注文データ</caption>
    <thead>
      <tr>
        <th scope="col">日時</th>
        <th scope="col">野菜データ</th>
        <th scope="col">合計金額</th>
        <th scope="col">希望日</th>
        <th scope="col">再度注文</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(element,uniqueKey) in OrderAllData[currentUser.uid]" :key="uniqueKey">
        <OrderHistoryElement 
        v-bind:data="element"
        v-bind:vege-alldata="vegeAllData"
        v-on:get-select-data="getSelectData"></OrderHistoryElement>
      </tr>
    </tbody>
  </table>
</article>
<article v-show="IsPopup" class="Histoty_popup">
  <h1>購入画面</h1>
  <table>
    <thead>
      <tr>
        <th scope="col">野菜名</th>
        <th scope="col">農家名</th>
        <th scope="col">販売単位</th>
        <th scope="col">単価</th>
        <th scope="col">購入個数</th>
        <th scope="col">合計金額</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(element, vegeName,index) in nowSelectData" :key="index">
        <template v-for="(vegeData, uniqueKey) in element" :key="uniqueKey">
          <OrderHistoryPopupElement
          v-bind:vege-data="vegeData"
          v-bind:vege-name="vegeName"
          v-bind:select-data="selectData[index]"
          v-bind:index="index"
          v-on:get-vege-count="getVegeCount"
          v-on:get-total-money="getTotalMoney"></OrderHistoryPopupElement>
        </template>
      </tr>
    </tbody>
  </table>
  <p>※購入時の値段や販売単価が違う場合があります。確認をお願いします。</p>
  <h4>総合金額:{{AllTotalMoney}}円</h4>
  <h4>希望日指定：{{ selectDate }}</h4>
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
  <button v-on:click="onPushBuy()">購入する</button>
</article>
</template>
<style>
.Histoty_popup{
  position: fixed;
  z-index: 1;
  border: 1px solid gray;
  border-radius: 20px;
  top: 20%;
  left: 20%;
  padding: 20px;
  background-color: white;
}
.history-button{
    background: white;
}
.history-button.active{
    background: rgb(189, 188, 188);
}
caption {
  caption-side: bottom;
  padding: 10px;
  font-weight: bold;
}

thead,
tfoot {
  background-color: rgb(228 240 245);
}

th,
td {
  border: 1px solid gray!important;
  padding: 8px 10px;
}

td:last-of-type {
  text-align: center;
}

tbody > tr:nth-of-type(even) {
  background-color: rgb(237 238 242);
}

tfoot th {
  text-align: right;
}

tfoot td {
  font-weight: bold;
}
</style>