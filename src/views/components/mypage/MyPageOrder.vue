<script setup lang="ts">
import { getDatabase, ref as fireRef, onValue,  } from 'firebase/database'
import { ref, computed } from 'vue'
import { type User } from 'firebase/auth'
interface Props {
  currentUser: User | null
}

const props = defineProps<Props>()

function readData() {
  if (props.currentUser == null) return
  const countRef = fireRef(getDatabase(), 'testOrders/' + props.currentUser.uid)
  
  const data = ref<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}
const myOrderDate = ref<any>(readData())
const myOrderKeys = computed(() => {
  return myOrderDate.value ? Object.keys(myOrderDate.value) : []
})
//これがすべての注文データから野菜のデータだけ抜いたやつ。注文の時間で昇順に並べてある。
//指定するときはmyDataKeysNum[何番目の][何個目]でやる
const myOrderKeysNum = computed(() => {
  return updateKeysNum()
})
function updateKeysNum() {
  let resultList: any = []
  for (let i: number = 0; i < myOrderKeys.value.length; i++) {
    resultList[i] = [] // ここで resultList[i] を初期化
    for (let j: number = 0; j < 1000; j++) {
      if (!myOrderDate.value || !myOrderDate.value[myOrderKeys.value[i]]) break
      if (myOrderDate.value[myOrderKeys.value[i]][j] === undefined) break
      resultList[i][j] = myOrderDate.value[myOrderKeys.value[i]][j]
    }
  }
  return resultList
}
const isToggle = ref<boolean>(false)
function pushToggle() {
  isToggle.value = !isToggle.value;
  
}

</script>
<template>
  <!-- <h1>{{ nyOrderKeys }}</h1>
  <p>{{ nyOrderData }}</p>
  <h3>{{ nyOrderKeysNum }}</h3> -->
  <!-- <h3>{{ OrderTimeList }}</h3> -->
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の注文</h2>
  </button>
  <article v-show="isToggle">
    <div>
      <div v-for="(item, index) in myOrderKeysNum" :key="index" class="order-item">
        <!-- {{ item }}
        {{ index }} -->

        <h2>注文日：{{ myOrderKeys[index] }}</h2>
        <h3>希望日: {{ myOrderDate[myOrderKeys[index]].selectDate }}</h3>
        <p>合計金額: {{ myOrderDate[myOrderKeys[index]].totalmoney }}円</p>
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
