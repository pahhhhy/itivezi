<script setup lang="ts">
import { getDatabase, ref as fireRef,  onValue } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import RegistrationStep1 from './components/Registration/RegistrationStep1.vue'
import RegistrationStep2 from './components/Registration/RegistrationStep2.vue'
import RegistrationStep3 from './components/Registration/RegistrationStep3.vue'
const vegeAllData = ref<any>(readData(''))

const vegeKeys = computed(() => {
  return vegeAllData.value ? Object.keys(vegeAllData.value) : []
})
//読みこむデータの指定
function readData(element: string) {
  const countRef = fireRef(getDatabase(), 'testVege/' + element)
  const data = ref<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}
const currentUser = ref<User | null>(null)
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


const stepNum = ref<number>(0)
function onStep(next: boolean) {
  if (next) stepNum.value = stepNum.value + 1
  else stepNum.value = stepNum.value - 1
}
function changeSelect(element: number[]) {
  vegeList.value = element
}

function updateStep2List(
  newVegeMoneyList: number[],
  newVegeAmountList: number[],
  newVegeUnitList: number[]
) {
  vegeMoneyList.value = newVegeMoneyList
  vegeAmountList.value = newVegeAmountList
  vegeUnitList.value = newVegeUnitList
}
const vegeList = ref<number[]>([])
const vegeMoneyList = ref<number[]>([])
const vegeAmountList = ref<number[]>([])
const vegeUnitList = ref<number[]>([])
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
  {{ vegeUnitList }} -->
  <RegistrationStep2
    v-bind:vege-list="vegeList"
    v-bind:vege-keys="vegeKeys"
    v-bind:vege-amount-list="vegeAmountList"
    v-bind:vege-money-list="vegeMoneyList"
    v-bind:vege-unit-list="vegeUnitList"
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
    v-bind:vege-unit-list="vegeUnitList"
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
