<script setup lang="ts">
import { ref,watch } from 'vue'
import { type User } from 'firebase/auth'
import { useFireOrderStore } from '@/stores/fireOrder';
import MyOrderElements from './MyOrderElements.vue';
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

interface Props {
  currentUser: User | null
}

const props = defineProps<Props>()
const FireOrderStore=useFireOrderStore()
const AllOrderData=ref<Ordertables>(FireOrderStore.OrderAllData)
const isToggle = ref<boolean>(false)
watch(() => FireOrderStore.OrderAllData, (newUser) => {
  AllOrderData.value = newUser;
});
function pushToggle() {
  isToggle.value = !isToggle.value;
}

</script>
<template>
  <!-- <h1>{{ nyOrderKeys }}</h1>-->
  <!-- <p>{{ myOrderData}}</p> -->
  <!-- {{myOrderVegeData}} -->
  <!-- <h3>{{ nyOrderKeysNum }}</h3> -->
  <!-- <h3>{{ OrderTimeList }}</h3> -->
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の注文</h2>
  </button>
  <article  v-if="props.currentUser!=null&&isToggle">
    <table>
      <caption>過去の注文データ</caption>
      <thead>
        <tr>
          <th scope="col">日時</th>
          <th scope="col">野菜データ</th>
          <th scope="col">合計金額</th>
          <th scope="col">希望日</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(element,uniqueKey) in  AllOrderData[props.currentUser.uid]" :key="uniqueKey">
          <MyOrderElements
          v-bind:data="element"
          ></MyOrderElements>
        </tr>
      </tbody>
    </table>
  </article>
</template>
<style>
.toggle-button {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}

.order-item {
  border: 1px solid gray;
}
</style>
