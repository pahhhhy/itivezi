<script setup lang="ts">
import { getDatabase, ref,  onValue } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import RegistrationStep1 from './components/Registration/RegistrationStep1.vue'
import RegistrationStep2 from './components/Registration/RegistrationStep2.vue'
import RegistrationStep3 from './components/Registration/RegistrationStep3.vue'
const VegeAllData = Vueref<any>(ReadData(''))

const vegekeys = computed(() => {
  return VegeAllData.value ? Object.keys(VegeAllData.value) : []
})
//読みこむデータの指定
function ReadData(element: string) {
  const CountRef = ref(getDatabase(), 'testVege/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}
const currentUser = Vueref<User | null>(null)
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


const Stepnum = Vueref<number>(0)
function OnStep(Next: boolean) {
  if (Next) Stepnum.value = Stepnum.value + 1
  else Stepnum.value = Stepnum.value - 1
}
function ChangeSelect(element: number[]) {
  VegeList.value = element
}

function UpdateStep2list(
  vegeMoneyList: number[],
  vegeAmoutList: number[],
  vegeTankaList: number[]
) {
  VegeMoneyList.value = vegeMoneyList
  VegeamoutList.value = vegeAmoutList
  VegetankaList.value = vegeTankaList
}
const VegeList = Vueref<number[]>([])
const VegeMoneyList = Vueref<number[]>([])
const VegeamoutList = Vueref<number[]>([])
const VegetankaList = Vueref<number[]>([])
</script>

<template>
  <div class="title">
    <h1>登録</h1>
  </div>
  <h1>Stepnum:{{ Stepnum }}</h1>
  <RegistrationStep1
    v-bind:vegeList="VegeList"
    v-bind:vegekeys="vegekeys"
    v-on:-on-step="OnStep"
    v-on:change-select="ChangeSelect"
    v-if="Stepnum == 0 && vegekeys != null"
  ></RegistrationStep1>
  <!-- {{ VegeMoneyList }}
  {{ VegeamoutList }}
  {{ VegetankaList }} -->
  <RegistrationStep2
    v-bind:vegeList="VegeList"
    v-bind:vegekeys="vegekeys"
    v-bind:-vege-amout-list="VegeamoutList"
    v-bind:-vege-money-list="VegeMoneyList"
    v-bind:-vege-tanka-list="VegetankaList"
    v-on:-on-step="OnStep"
    v-on:-update-step2-list="UpdateStep2list"
    v-if="Stepnum == 1 && vegekeys != null"
  ></RegistrationStep2>
  <!-- 送信と確認画面 -->
  <RegistrationStep3
    v-bind:vegeList="VegeList"
    v-bind:vegekeys="vegekeys"
    v-bind:-vege-amout-list="VegeamoutList"
    v-bind:-vege-money-list="VegeMoneyList"
    v-bind:-vege-tanka-list="VegetankaList"
    v-bind:current-user="currentUser"
    v-on:-on-step="OnStep"
    v-if="Stepnum == 2 && vegekeys != null"
  ></RegistrationStep3>
</template>
<style>
.title {
  text-align: center;
}
</style>
