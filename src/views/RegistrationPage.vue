<script setup lang="ts">
import { getDatabase, ref as fireRef,  onValue } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import RegistrationStep1 from './components/Registration/RegistrationStep1.vue'
import RegistrationStep2 from './components/Registration/RegistrationStep2.vue'
import RegistrationStep3 from './components/Registration/RegistrationStep3.vue'
import SelectRoadStation from './components/SelectRoadStation.vue'
const vegeAllData = ref<any>(null)
const vegeKeys = ref<any>(null)
//読みこむデータの指定
function readvegeAllData(roadStation: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testVege/' + roadStation + "/")
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
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
  data:{money?:number[];amount?:number[];unit?:string[];}
) {
  if (data.money !== undefined) {
    vegeMoneyList.value=data.money
  }
  if (data.amount !== undefined) {
    vegeAmountList.value = data.amount
  }
  if (data.unit !== undefined) {
    vegeUnitList.value = data.unit
  }
}
async function  updateRoadStation(element:string){
  roadStation.value=element
  vegeAllData.value=await readvegeAllData(element)
  vegeKeys.value= Object.keys(vegeAllData.value)
}
const vegeList = ref<number[]>([])
const vegeMoneyList = ref<number[]>([])
const vegeAmountList = ref<number[]>([])
const vegeUnitList = ref<string[]>([])
const roadStation = ref<string>("")
</script>

<template>
  <!-- {{ roadStationUnitList }}
  {{ vegeUnitList }} -->
  <div class="title">
    <h1>登録</h1>
  </div>
  <SelectRoadStation
  v-bind:-road-station="roadStation"
  v-on:on-step="onStep"
  v-on:update-road-station="updateRoadStation"
  v-if="stepNum==0">
</SelectRoadStation>
  <RegistrationStep1
    v-bind:vegeList="vegeList"
    v-bind:vegeKeys="vegeKeys"
    v-on:-on-step="onStep"
    v-on:change-select="changeSelect"
    v-if="stepNum == 1 && vegeKeys != null"
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
    v-if="stepNum == 2 && vegeKeys != null"
  ></RegistrationStep2>
  <!-- 送信と確認画面 -->
  <RegistrationStep3
    v-bind:vege-list="vegeList"
    v-bind:vege-keys="vegeKeys"
    v-bind:vege-amount-list="vegeAmountList"
    v-bind:vege-money-list="vegeMoneyList"
    v-bind:vege-unit-list="vegeUnitList"
    v-bind:current-user="currentUser"
    v-bind:road-station="roadStation"
    v-on:on-step="onStep"
    v-if="stepNum == 3 && vegeKeys != null"
  ></RegistrationStep3>
</template>
<style>
.title {
  text-align: center;
}
</style>
