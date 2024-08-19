<script setup lang="ts">
import { getDatabase, ref as Fireref, child, get, onValue, set, remove } from 'firebase/database'
import { ref as Vueref, computed, onMounted, watch } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
interface Porps {
  currentUser: User | null
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
console.log('user:' + porps.currentUser)
function ReadData() {
  if (porps.currentUser == null) return
  const CountRef = Fireref(getDatabase(), 'testOrders/' + porps.currentUser.uid)
  console.log(porps.currentUser.uid)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}
const MyOrderDate = Vueref<any>(ReadData())
const MyOrderkeys = computed(() => {
  return MyOrderDate.value ? Object.keys(MyOrderDate.value) : []
})
//これがすべての注文データから野菜のデータだけ抜いたやつ。注文の時間で昇順に並べてある。
//指定するときはMydateKeysNum[何番目の][何個目]でやる
const MyOrderkeysNum = computed(() => {
  return UpdateKeysnum()
})
function UpdateKeysnum() {
  let resultlist: any = []
  for (let i: number = 0; i < MyOrderkeys.value.length; i++) {
    resultlist[i] = [] // ここで resultlist[i] を初期化
    for (let j: number = 0; j < 1000; j++) {
      if (!MyOrderDate.value || !MyOrderDate.value[MyOrderkeys.value[i]]) break
      if (MyOrderDate.value[MyOrderkeys.value[i]][j] === undefined) break
      resultlist[i][j] = MyOrderDate.value[MyOrderkeys.value[i]][j]
      console.log(i)
    }
  }
  return resultlist
}
const IsToggle = Vueref<boolean>(false)
function Pushtoggle() {
  if (IsToggle.value) IsToggle.value = false
  else IsToggle.value = true
  console.log(IsToggle.value)
}
//MyOrderkeysNumが更新されたらこれを更新するようにしたい
const OrderTimeList = Vueref<string[]>([])
function SetOrderTime(timeList: string[]) {
  let resultList: any = 0
  if (timeList.length == 0) {
    console.error('きーが無いぞ')
  } else {
    for (let i: number = 0; i < timeList.length; i++) {
      resultList[i] = parseTimestamp(timeList[i])
    }
  }
  OrderTimeList.value = resultList
}

function parseTimestamp(timestamp: string) {
  // 各要素を分割して取得
  const [year, month, day, hours, minutes, seconds] = timestamp.split('-').map(Number)
  let time = year + '年' + month + '月' + day + '日' + hours + '時' + minutes + '分'
  return time
}
</script>
<template>
  <!-- <h1>{{ MyOrderkeys }}</h1>
  <p>{{ MyOrderDate }}</p>
  <h3>{{ MyOrderkeysNum }}</h3> -->
  <!-- <h3>{{ OrderTimeList }}</h3> -->
  <button v-on:click="Pushtoggle()" class="Tbutton">
    <i class="bi bi-caret-down-fill" v-show="!IsToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="IsToggle"></i>
    <h2>自分の注文</h2>
  </button>
  <article v-show="IsToggle">
    <div>
      <div v-for="(item, index) in MyOrderkeysNum" :key="index" class="order-item">
        <!-- {{ item }}
        {{ index }} -->

        <h2>注文日：{{ MyOrderkeys[index] }}</h2>
        <h3>希望日: {{ MyOrderDate[MyOrderkeys[index]].selectDate }}</h3>
        <p>合計金額: {{ MyOrderDate[MyOrderkeys[index]].totalmoney }}円</p>
        <div v-for="(element, num) in item" :key="num">
          <h3>野菜名: {{ item[num].vegeName }}</h3>
          <p>生産者名: {{ item[num].farmername }}</p>
          <p>単価: {{ item[num].unit }}</p>
          <p>個数: {{ item[num].amout }}</p>
          <p>金額: {{ item[num].price }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
<style>
.Tbutton {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}

.order-item {
  border: 1px solid gray;
}
</style>
