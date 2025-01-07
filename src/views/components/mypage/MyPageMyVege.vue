<script setup lang="ts">
import { ref,watch} from 'vue'
import { type User } from 'firebase/auth'
import { useVegeStore } from '@/stores/vege'
import MyVegeElement from './MyVegeElement.vue';
import MyVegePopup from './MyVegePopup.vue';
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
interface MyVegeTables{
  [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string[]
            state:VegeState
            uid:string
            unit:string
            photo:string
            VegeName:string
        }
}
interface datatable {
  en:number;
  farmer:string
  roadStation:string[]
  state:VegeState
  uid:string
  unit:string
  photo:string
  VegeName:string
}
  const vegeStore=useVegeStore()
const isToggle = ref<boolean>(false)
const MyVegeData=ref<MyVegeTables>({})
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const IsPopup=ref<boolean>(false)
const changeData=ref<datatable>()
const Changeunique=ref<string|number>("")
  const userStore=useUserStore()
  const currentUser = ref(userStore.currentUser);
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
  initData()
});
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
function initData(){
  let fileterData=filterAvailableVegetables(vegeAllData.value)
  if(currentUser.value&&currentUser.value.displayName){
    const filterMyData:Vegetables=getFarmerData(fileterData,currentUser.value.displayName)
    MyVegeData.value=convertToMyVegeTables(filterMyData)
  }
  
 

}

async function deleteVegeData( unique: string|number,vege: string ): Promise<void>  {
  await vegeStore.deleteVegeData(vege,unique)
  initData()
}

function pushToggle() {
  isToggle.value = !isToggle.value;
}
function filterAvailableVegetables(data: Vegetables): Vegetables {
    const result: Vegetables = {};
    for (const vegeName in data) {
        const filteredEntries: { [uniqueKey: string]: any } = {};
        for (const uniqueKey in data[vegeName]) {
            if (data[vegeName][uniqueKey].state === VegeState.Available) {
                filteredEntries[uniqueKey] = data[vegeName][uniqueKey];
            }
        }
        // もしfilteredEntriesに要素があれば、resultに追加
        if (Object.keys(filteredEntries).length > 0) {
            result[vegeName] = filteredEntries;
        }
    }
    return result;
}

function getFarmerData(data: Vegetables, farmerName: string): Vegetables {
  const result: Vegetables = {};
  
  // 野菜名のループ
  for (const vegeName in data) {
    if (Object.prototype.hasOwnProperty.call(data, vegeName)) {
      
      // ユニークキーごとのループ
      for (const uniqueKey in data[vegeName]) {
        if (Object.prototype.hasOwnProperty.call(data[vegeName], uniqueKey)) {
          
          const item = data[vegeName][uniqueKey];
          
          // farmer名が一致する場合リストに追加
          if (item.farmer === farmerName) {
            // `vegeName` が `result` に存在しなければ初期化
            if (!result[vegeName]) {
              result[vegeName] = {};
            }
            // `uniqueKey` を使って該当データを追加
            result[vegeName][uniqueKey] = item;
          }
        }
      }
    }
  }

  return result;
}
initData()
function convertToMyVegeTables(data: Vegetables): MyVegeTables {
  const result: MyVegeTables = {};

  // Iterate over each vegeName in the Vegetables data
  for (const vegeName in data) {
    if (Object.prototype.hasOwnProperty.call(data, vegeName)) {
      const vegeEntries = data[vegeName];

      // Iterate over each uniqueKey inside the vegeEntries
      for (const uniqueKey in vegeEntries) {
        if (Object.prototype.hasOwnProperty.call(vegeEntries, uniqueKey)) {
          const vegeData = vegeEntries[uniqueKey];

          // Add the vegeData along with the VegeName to the result
          result[uniqueKey] = {
            ...vegeData,
            VegeName: vegeName
          };
        }
      }
    }
  }

  return result;
}
function changeVegeData(unique: string|number,vegedata:datatable){
  IsPopup.value=true
  changeData.value=vegedata
  Changeunique.value=unique
}
async function onPushChange(uproadData:Vegetables){
  IsPopup.value=!await vegeStore.updateVegeData(uproadData)
}
function onPushBack(){
  IsPopup.value=false
}
</script>
<template>
  <article class="myvege_card">
    <h2>自分の野菜</h2>
    <article class="myvege_elementgroup">
      <div v-for="(elements, unique) in MyVegeData" :key="unique" >
        <MyVegeElement
        v-bind:-vege-data="elements"
        v-bind:unique="unique"
        v-on:delete-vege-data="deleteVegeData"
        v-on:change-vege-data="changeVegeData"
        ></MyVegeElement>
      </div>
    </article>
    
  </article>
  <article v-if="IsPopup&&changeData">
    <MyVegePopup
    v-bind:unique-key="Changeunique"
    v-bind:vegedata="changeData"
    v-on:on-push-change="onPushChange"
    v-on:on-push-back="onPushBack"></MyVegePopup>
  </article>
</template>
<style>
.myvege_card{
  width: 512px;
  height: 250px;
  border: none;
  background-color: white;
  border-radius: 5px;
  margin :20px auto;
  padding: 5px 20px;
}
.myvege_elementgroup{
  overflow-y: scroll;
  height: 200px;
}
.myvege_elementgroup::-webkit-scrollbar {
  width:10px;
}
.myvege_elementgroup::-webkit-scrollbar-thumb {
  background: var(--line-color);
  width: 6px;
  height: 6px;
  border-radius: 5px;
}
.myvege_card h2{
  border-bottom: 1px solid var(--text-color);
}
@media (max-width: 575.98px) { 
  .myvege_card{
    width: 340px;
  }
}
</style>
