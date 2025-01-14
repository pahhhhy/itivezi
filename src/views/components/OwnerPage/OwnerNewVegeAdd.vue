<script setup lang="ts">

//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref,watch} from 'vue'
import RegistrationStep2 from '../Registration/RegistrationStep2.vue'
import RegistrationStep3 from '../Registration/RegistrationStep3.vue'
import { useVegeStore } from "@/stores/vege"
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
const uniqueKey=ref<string|null>(vegeStore.getUniqueKey())
const vegeName=ref<string>("")
const stepNum = ref<number>(0)
const vegeList = ref<string[]>([])
const step1Error=ref<boolean>(false)
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
  vegeKeys.value= vegeStore.getKeys()
});
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});

function onStep(next: boolean) {
  if (next) stepNum.value = stepNum.value + 1
  else stepNum.value = stepNum.value - 1
}
function step1onStep1(){
    if(Object.keys(uproadVegeData.value).length==0){
        step1Error.value=true
    }else{
        onStep(true)
    }
}
function changeVege() {
  if(uniqueKey.value&&currentUser.value?.displayName&&currentUser.value?.uid){
    uproadVegeData.value[vegeName.value]={
    [uniqueKey.value]:{
      en: -1,
      farmer: currentUser.value.displayName,
      roadStation: [],
      state: VegeState.Available,
      uid: currentUser.value?.uid,
      unit: "",
      photo: "none"
    }
  }
  
  }else{
    console.error("myUidnaizo")
  }
  vegeList.value.push(vegeName.value)
}
</script>

<template>
    <!-- {{uproadVegeData}} -->
  <div class="title">
    <h1>新しい野菜の追加</h1>
  </div>
  <article v-if="stepNum==0">
    <div class="mb-3">
        <label for="VegeNameInput" class="form-label">新しい野菜名</label>
        <input type="text" class="form-control" id="VegeNameInput" placeholder="野菜名" v-model="vegeName">
      </div>
      <div v-for="(element,vegeName) in uproadVegeData" :key="vegeName">
        <p>{{vegeName}}</p>
      </div>
      <h1 style="color: red" v-show="step1Error && Object.keys(uproadVegeData).length==0">
        野菜を入力してください
      </h1>
      <button v-on:click="changeVege" class="btn btn-primary">追加</button>
      <button v-on:click="step1onStep1()" class="btn btn-primary" >次へ</button>
  </article>
  
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
