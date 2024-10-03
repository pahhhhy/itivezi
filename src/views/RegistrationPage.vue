<script setup lang="ts">

//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref,watch} from 'vue'
import RegistrationStep1 from './components/Registration/RegistrationStep1.vue'
import RegistrationStep2 from './components/Registration/RegistrationStep2.vue'
import RegistrationStep3 from './components/Registration/RegistrationStep3.vue'
import { useVegeStore } from '@/stores/vege'
import { useUserStore } from '@/stores/userData';

interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:State
            uid:string
            unit:string
            photo:string
        }
    }
}
const userStore=useUserStore()
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const vegeKeys = ref<string[]>(vegeStore.getKeys())
const uproadVegeData=ref<Vegetables>({})
const uniqueKey=ref<string|null>(vegeStore.getUniqueKey())
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
  vegeKeys.value= vegeStore.getKeys()
});
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
const stepNum = ref<number>(0)
function onStep(next: boolean) {
  if (next) stepNum.value = stepNum.value + 1
  else stepNum.value = stepNum.value - 1
}

function changeSelect(element: number[]) {
  vegeList.value = element
}
function updateUproadData(Data:Vegetables){
  uproadVegeData.value=Data
}
const vegeList = ref<number[]>([])
</script>

<template>
  <!-- {{ roadStationUnitList }}
  {{ vegeUnitList }} -->
   <!-- {{ vegeKeys }} -->
     <!-- {{ vegeList }} -->
  <div class="title">
    <h1>登録</h1>
  </div>
  <!-- {{ uniqueKey }}
  {{ uproadVegeData }} -->
  <RegistrationStep1
      v-bind:vegeList="vegeList"
      v-bind:vegeKeys="vegeKeys"
      v-bind:uproad-data="uproadVegeData"
      v-bind:uniquw-key="uniqueKey"
      v-on:-on-step="onStep"
      v-on:update-uproad-data="updateUproadData"
      v-on:change-select-list="changeSelect"
      v-if="stepNum == 0 && vegeKeys != null"
  ></RegistrationStep1>
  <!-- {{ VegeMoneyList }}
  {{ vegeAmountList }}
  {{ vegeUnitList }} -->
  <RegistrationStep2
      v-bind:vege-list="vegeList"
      v-bind:vege-keys="vegeKeys"
      v-bind:unique-key="uniqueKey"
      v-bind:uproad-data="uproadVegeData"
      v-on:on-step="onStep"
      v-if="stepNum == 1 && vegeKeys != null"
  ></RegistrationStep2>
  <!-- 送信と確認画面 -->
  <RegistrationStep3
      v-bind:vege-list="vegeList"
      v-bind:vege-keys="vegeKeys"
      v-bind:current-user="currentUser"
      v-bind:uproad-data="uproadVegeData"
      v-bind:unique-key="uniqueKey"
      v-on:on-step="onStep"
      v-if="stepNum == 2 && vegeKeys != null"
  ></RegistrationStep3>
</template>
<style>
.title {
  text-align: center;
}
</style>
