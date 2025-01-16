<script setup lang="ts">

//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref,watch,onMounted} from 'vue'
import RegistrationStep1 from './components/Registration/RegistrationStep1.vue'
import RegistrationStep2 from './components/Registration/RegistrationStep2.vue'
import RegistrationStep3 from './components/Registration/RegistrationStep3.vue'
import { useVegeStore } from '@/stores/vege'
import { useUserStore } from '@/stores/userData';
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string[]
            state:VegeState
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
  const vegeList = ref<string[]>([])
const uniqueKey=ref<string|null>(vegeStore.getUniqueKey())
onMounted(() => {
  vegeAllData.value = vegeStore.VegeAllData;
  vegeKeys.value= vegeStore.getKeys()
  // データがロードされてから initData を呼ぶ
  watch(
    () => vegeStore.VegeAllData,
    (newData) => {
      vegeAllData.value = newData;
      vegeKeys.value= vegeStore.getKeys()
    },
    { immediate: true }
  );})
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
const stepNum = ref<number>(0)
function onStep(next: boolean) {
  if (next) stepNum.value = stepNum.value + 1
  else stepNum.value = stepNum.value - 1
}

function changeSelect(element: string[]) {
  vegeList.value = element
}
function updateUproadData(Data:Vegetables){
  uproadVegeData.value=Data
}

</script>

<template>
  <!-- {{ roadStationUnitList }}
  {{ vegeUnitList }} -->
     <!-- {{ vegeList }} -->
  <!-- {{ uniqueKey }}
  {{ uproadVegeData }} -->
  <article class="road" v-if="stepNum == 0 && Object.keys(vegeKeys).length == 0 ">
    <div class="three-quarter-spinner"></div>
  </article >
  <RegistrationStep1
      v-bind:vegeList="vegeList"
      v-bind:vegeKeys="vegeKeys"
      v-bind:uproad-data="uproadVegeData"
      v-bind:uniquw-key="uniqueKey"
      v-on:-on-step="onStep"
      v-on:update-uproad-data="updateUproadData"
      v-on:change-select-list="changeSelect"
      v-if="stepNum == 0 && Object.keys(vegeKeys).length != 0 "
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
@keyframes spin {
  from {
    transform: rotate(0);
  }
  to{
    transform: rotate(359deg);
  }
}
.title {
  text-align: center;
}
.road{
  width: 50px;
  height: 50px;
  margin: auto;}
  .three-quarter-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid var(--main-color);
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin .5s linear 0s infinite;
  }
</style>
