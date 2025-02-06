<script setup lang="ts">
import { ref,watch,computed} from 'vue'
import { type User} from 'firebase/auth'
import { useVegeStore } from '@/stores/vege'
import { useUserStore } from '@/stores/userData';
import { usefireUserStore } from '@/stores/fireUserdata';
import OwnerVegeOwnerPage from './OwnerVegeOwnerPage.vue'
interface Usertables{
    affiliation:String[]
   
    name:string
    phoneNumber:number
    place:string
    role:Role
    email:string
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
            roadStation:string[]
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
  interface VegeList{
     [key: string]: string[] ;
  }
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
  const userStore=useUserStore()
const unavailableVegeList = ref<string[]>([])
const AvailableVegeLIst=ref<Vegetables>(filterVegetablesByState(vegeAllData.value))
const farmerVegeList = ref<VegeList>({})
const uniqueVegeList = ref<VegeList>({})
const deleteVegeName = ref<string>("")
const isPopup = ref<boolean>(false)
const fireUseStore=usefireUserStore()
const currentUser = ref<User|null>(userStore.currentUser);
const myUserData=ref<Usertables>(fireUseStore.myUserData)
const deleteVegeNum=ref<number>(0)
watch(() => fireUseStore.myUserData, (newUser) => {
  myUserData.value = newUser;
});
  watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
});
function filterByRoadStation(vegetables: Vegetables, role: Role) {
    const result: Vegetables = {};
    
    for (const vegeName in vegetables) {
        const filteredEntries = Object.entries(vegetables[vegeName]).filter(
            ([uniqueKey, data]) => data.roadStation.includes(role)
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
  return available;
}

function extractVegetableInfo(data: Vegetables): VegeList {
  const result: VegeList = {};
  const uidResult: VegeList = {};

  for (const vegetable in data) {
    const farmers = Object.entries(data[vegetable]); // farmers: [uniqueKey, farmerInfo][]

    if (farmers.length > 1) {
      const uniqueFarmers = new Set<string>();
      const uniqueUIDs = new Set<string>();

      for (const [uid, farmerInfo] of farmers) {
        uniqueFarmers.add(farmerInfo.farmer); // farmer を追加
        uniqueUIDs.add(uid); // UID を追加
      }

      result[vegetable] = Array.from(uniqueFarmers); // 生産者名リスト
      uidResult[vegetable] = Array.from(uniqueUIDs); // UID リスト
    } else if (farmers.length === 1) {
      const [uid, farmerInfo] = farmers[0];
      result[vegetable] = [farmerInfo.farmer]; // 生産者名を配列に
      uidResult[vegetable] = [uid]; // UID を配列に
    }
  }

  // uidResult をリアクティブ変数に保存
  uniqueVegeList.value = uidResult;
  return result;
}
const ComponentUpdate=ref<boolean>(false)
async function initData() {
  
  //それぞれの道の駅のデータに抽出する
  if(myUserData.value.role==Role.Kawasaki){
      vegeAllData.value=filterByRoadStation(vegeAllData.value,Role.Kawasaki)
    }else if(myUserData.value.role==Role.Murone){
      vegeAllData.value=filterByRoadStation(vegeAllData.value,Role.Murone)
  }
  //野菜のデータからstateがAvailbleのものを取り出す
  AvailableVegeLIst.value=filterVegetablesByState(vegeAllData.value)
  //野菜のデータから農家の名前を取り出す。
  farmerVegeList.value = extractVegetableInfo(AvailableVegeLIst.value)
  ComponentUpdate.value=true
}

initData()

function pushDeleteIcon(vegeName: string) {
  deleteVegeName.value = vegeName
  isPopup.value = true
  deleteVegeNum.value=farmerVegeList.value[deleteVegeName.value].length
}

async function pushDelete() {
  ComponentUpdate.value=false
  await vegeStore.deleteAllVegeData(deleteVegeName.value)
  await vegeStore.roadData()
  initData()
  isPopup.value = false
}

function pushBack() {
  isPopup.value = false
}

</script>
<template>
    <article class="onwerVegeList">
      <OwnerVegeOwnerPage 
      v-if="ComponentUpdate"
      v-bind:current-user="currentUser"
      v-bind:data="AvailableVegeLIst"
      v-bind:unavailable-vege-list="unavailableVegeList"
      v-bind:role="myUserData.role"
      v-on:delete-icon="pushDeleteIcon"></OwnerVegeOwnerPage>
    </article>
  <div class="owner-popup" v-if="isPopup">
    <h3>{{ deleteVegeName }}は以下の{{
        deleteVegeNum
    }}人が出品しています。<br>本当に削除しますか？</h3>
    <div style="font-size: 18px;" v-for="farmerName in farmerVegeList[deleteVegeName]" :key="farmerName">
      ・{{ farmerName }}
    </div>
    <button v-on:click="pushDelete()">削除する</button>
    <button v-on:click="pushBack()">戻る</button>
  </div>
</template>
<style>
.onwerVegeList{
  
}
.owner-popup {
  position: fixed;
  width: 512px;

  z-index: 10;
  border: 1px solid gray;
  border-radius: 20px;
  top: calc(50% - 150px);
  left: calc(50% - 170px);
  padding: 20px;
  background-color: white;
}
.owner-popup h3{
  font-size: 24px;
}
.owner-popup button {
  font-size: 1.2rem;
  padding: 15px 30px;
  margin: 10px;
  border-radius: 30px;
  border:none;
  color: white;
  background-color: var(--main-color);
}

.vege-title {
  margin-top: 20px;
}

.vegeList-group {
  margin: 10px;
  font-size: large
}

.vegeList-group-active {
  margin: 5px;
  font-size: large;
  width: 280px;
}

.vegeList-button {
  font-size: 1.2rem;
  padding: 15px 30px;
  margin: 5px;
  border-radius: 30px;
  border:none;
  color: white;
  background-color: var(--main-color);
}

.vegeList-unit-icon-active {
  display: flex;
  align-items: center;

}
.vegeList-unit-active p{
  margin-bottom: 2px;

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
@media (max-width: 575.98px) { 
  .owner-popup{
      width: 340px;
      padding: 10px;
  }
}
</style>