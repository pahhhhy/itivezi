<script setup lang="ts">
import { ref,watch} from 'vue'
import { type User} from 'firebase/auth'
import { useVegeStore } from '@/stores/vege'
import { useUserStore } from '@/stores/userData';
import { usefireUserStore } from '@/stores/fireUserdata';
import OwnerVegeOwnerPage from './OwnerVegeOwnerPage.vue'
interface Usertables{
    affiliation:String[]
    gender:string
    name:string
    phoneNumber:number
    place:string
    role:Role
}

enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [VegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
    }
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
  }
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
  const userStore=useUserStore()
const unavailableVegeList = ref<string[]>([])
const AvailableVegeLIst=ref<Vegetables>(filterVegetablesByState(vegeAllData.value))
const farmerVegeList = ref<any>([])
const uniqueVegeList = ref<any>([])
const deleteVegeName = ref<string>("")
const isPopup = ref<boolean>(false)
const fireUseStore=usefireUserStore()
const currentUser = ref<User|null>(userStore.currentUser);
const myUserData=ref<Usertables>(fireUseStore.myUserData)
watch(() => fireUseStore.myUserData, (newUser) => {
  myUserData.value = newUser;
});
  watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
});
function filterByRoadStation(vegetables: Vegetables,role:Role) {
    const result: Vegetables = {};
    for (const vegeName in vegetables) {
        const filteredEntries = Object.entries(vegetables[vegeName]).filter(
            ([uniqueKey, data]) => data.roadStation === role
        );

        if (filteredEntries.length > 0) {
            result[vegeName] = Object.fromEntries(filteredEntries);
        }
    }

    return result;
}
function filterVegetablesByState(vegetables: Vegetables) {
  let available: Vegetables = {};
  let unavailableVegeNames: string[] = [];

  Object.keys(vegetables).forEach(outerKey => {
    let hasAvailable = false;
    Object.keys(vegetables[outerKey]).forEach(innerKey => {
      const item = vegetables[outerKey][innerKey];
      if (item.state === VegeState.Available) {
        hasAvailable = true; // Available なデータがある場合にフラグを立てる
        if (!available[outerKey]) {
          available[outerKey] = {};
        }
        available[outerKey][innerKey] = item;
      }
    });

    // Available なデータが1つもない場合にのみ unavailableVegeNames に追加
    if (!hasAvailable) {
      unavailableVegeNames.push(outerKey);
    }
  });

  // unavailableVegeList.value に string[] を代入
  unavailableVegeList.value = unavailableVegeNames;
  console.log(unavailableVegeList.value)
  return available;
}

function extractVegetableInfo(data: any): { [key: string]: string[] } {
  const result: { [key: string]: string[] } = {};
  const uidResult: { [key: string]: string[] } = {};

  for (const vegetable in data) {
    const farmers = Object.entries(data[vegetable]);

    // 複数の農家がある場合
    if (farmers.length > 1) {
      const uniqueFarmers = new Set<string>();
      const uniqueUIDs = new Set<string>();

      for (const [uid, farmerInfo] of farmers) {
        uniqueFarmers.add((farmerInfo as any).farmer);
        uniqueUIDs.add(uid);
      }

      result[vegetable] = Array.from(uniqueFarmers); // キーが野菜、値が生産者名のリスト
      uidResult[vegetable] = Array.from(uniqueUIDs); // キーが野菜、値がUIDのリスト
    } else {
      // 単一の農家がある場合
      const [uid, farmerInfo] = farmers[0];
      result[vegetable] = [(farmerInfo as any).farmer]; // キーが野菜、値が生産者名のリスト
      uidResult[vegetable] = [uid]; // キーが野菜、値がUIDのリスト
    }
  }

  uniqueVegeList.value = uidResult;
  return result;
}

async function initData() {
  if(myUserData.value.role==Role.Kawasaki){
      vegeAllData.value=filterByRoadStation(vegeAllData.value,Role.Kawasaki)
    }else if(myUserData.value.role==Role.Murone){
      vegeAllData.value=filterByRoadStation(vegeAllData.value,Role.Murone)
  }
  AvailableVegeLIst.value=filterVegetablesByState(vegeAllData.value)
  farmerVegeList.value = extractVegetableInfo(vegeAllData.value)
}

initData()

function pushDeleteIcon(vegeName: string) {
  deleteVegeName.value = vegeName
  isPopup.value = true
}

async function pushDelete() {
  isPopup.value = false
  await vegeStore.deleteAllVegeData(deleteVegeName.value)
}

function pushBack() {
  isPopup.value = false
}

</script>
<template>
  {{ vegeAllData }}
  <!-- {{ farmerVegeList }}
  {{uniqueVegeList}} -->
  <!-- {{ CSVfile }} -->
    <!-- 管理者は全てのリストを選択したときの注文の並び順を変更できる。
    道の駅はそのところを選択したときの注文の並び順を変更できる。 -->
    <!-- {{ AvailableVegeLIst }}
      {{ unavailableVegeList }} -->
    <article >
      <OwnerVegeOwnerPage 
      v-bind:current-user="currentUser"
      v-bind:data="AvailableVegeLIst"
      v-bind:unavailable-vege-list="unavailableVegeList"
      v-bind:role="myUserData.role"
      v-on:delete-icon="pushDeleteIcon"></OwnerVegeOwnerPage>
    </article>
  <div class="owner-popup" v-if="isPopup">
    <h3>{{ deleteVegeName }}は以下の{{
        farmerVegeList[deleteVegeName].length
      }}人が出品しています。本当に削除しますか？</h3>
    <div v-for="farmerName in farmerVegeList[deleteVegeName]" :key="farmerName">
      {{ farmerName }}
    </div>
    <button v-on:click="pushDelete()">削除する</button>
    <button v-on:click="pushBack()">戻る</button>
  </div>
</template>
<style>
.owner-popup {
  border-radius: 20px;
  border: 1px gray solid;
  z-index: 1;
  background-color: white;
  position: absolute;
  top: 30%;
  left: 30%;
  padding: 3%;
}

.owner-popup button {
  background-color: white;
  padding: 1%;
  margin: 1%;
}

.vege-title {
  margin-top: 20px;
}

.vegeList-group {
  margin: 10px;
  font-size: large
}

.vegeList-group-active {
  margin: 10px;
  font-size: large;
  width: 400px;
}

.vegeList-button {
  background-color: white;
  font-size: 1.2rem;
  padding: 5px;
  margin: 5px;
  border-radius: 10px;
}

.vegeList-unit-icon-active {
  display: flex;
  align-items: center;

}

.vegeList-unit-icon-active button {
  padding: 0;
  height: 100%;
  border: none;
  display: flex;
  background-color: white;
}

.vegeList-unit-active {
  display: flex;
  justify-content: space-between;
}
</style>