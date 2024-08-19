<script setup lang="ts">
import { getDatabase, ref,  onValue } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as vueRef, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import RegistrationStep1 from './components/Registration/RegistrationStep1.vue'
import RegistrationStep2 from './components/Registration/RegistrationStep2.vue'
import RegistrationStep3 from './components/Registration/RegistrationStep3.vue'
const vegeAllData = vueRef<any>(readData(''))

const vegeKeys = computed(() => {
  return vegeAllData.value ? Object.keys(vegeAllData.value) : []
})
//読みこむデータの指定
function readData(element: string) {
  const countRef = ref(getDatabase(), 'testVege/' + element)
  const data = vueRef<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}
const currentUser = vueRef<User | null>(null)
//指定したデータを書き込むようにしている。Vegeに該当の野菜
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user

    } else {
      currentUser.value = null
    }
  })
})


const stepNum = vueRef<number>(0)
function onStep(next: boolean) {
  if (next) stepNum.value = stepNum.value + 1
  else stepNum.value = stepNum.value - 1
}
function changeSelect(element: number[]) {
  vegeList.value = element
}

function updateStep2List(
  vegeMoneyList: number[],
  vegeAmountList: number[],
  vegeTankaList: number[]
) {
  vegeMoneyList.value = vegeMoneyList
  vegeAmountList.value = vegeAmountList
  vegeTankaList.value = vegeTankaList
}
const vegeList = vueRef<number[]>([])
const vegeMoneyList = vueRef<number[]>([])
const vegeAmountList = vueRef<number[]>([])
const vegeTankaList = vueRef<number[]>([])
</script>

<template>
  <div class="title">
    <h1>登録</h1>
  </div>
  <h1>Stepnum:{{ stepNum }}</h1>
  <RegistrationStep1
    v-bind:vegeList="vegeList"
    v-bind:vegeKeys="vegeKeys"
    v-on:-on-step="onStep"
    v-on:change-select="changeSelect"
    v-if="stepNum == 0 && vegeKeys != null"
  ></RegistrationStep1>
  <!-- {{ VegeMoneyList }}
  {{ vegeAmountList }}
  {{ vegeTankaList }} -->
  <RegistrationStep2
    v-bind:vege-list="vegeList"
    v-bind:vege-keys="vegeKeys"
    v-bind:vege-amount-list="vegeAmountList"
    v-bind:vege-money-list="vegeMoneyList"
    v-bind:vege-tanka-list="vegeTankaList"
    v-on:on-step="onStep"
    v-on:update-step2-list="updateStep2List"
    v-if="stepNum == 1 && vegeKeys != null"
  ></RegistrationStep2>
  <!-- 送信と確認画面 -->
  <RegistrationStep3
    v-bind:vege-list="vegeList"
    v-bind:vege-keys="vegeKeys"
    v-bind:vege-amount-list="vegeAmountList"
    v-bind:vege-money-list="vegeMoneyList"
    v-bind:vege-tanka-list="vegeTankaList"
    v-bind:current-user="currentUser"
    v-on:on-step="onStep"
    v-if="stepNum == 2 && vegeKeys != null"
  ></RegistrationStep3>
</template>
<style>
.title {
  text-align: center;
}
</style>
