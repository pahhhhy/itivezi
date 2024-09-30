<script setup lang="ts">
import { ref,watch} from 'vue'
import { type User } from 'firebase/auth'
import { useVegeStore } from '@/stores/vege'
import MyVegeElement from './MyVegeElement.vue';
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:string
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
            roadStation:string
            state:string
            uid:string
            unit:string
            photo:string
            VegeName:string
        }
}
  const vegeStore=useVegeStore()
interface Props {
  currentUser: User
}
const props = defineProps<Props>()
const isToggle = ref<boolean>(false)
const MyVegeData=ref<MyVegeTables>({})
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
  initData()
});
function initData(){
  let fileterData=filterAvailableVegetables(vegeAllData.value)
  if(props.currentUser.displayName){
    const filterMyData:Vegetables=getFarmerData(fileterData,props.currentUser.displayName)
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
            if (data[vegeName][uniqueKey].state === "Available") {
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
</script>
<template>
  <!-- {{props.vegeAllData}} -->
  <!-- {{ props.vegeAllData }} -->
  <!-- <h2>{{ targetList }}</h2> -->
   <!-- {{ MyVegeData }} -->
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の野菜</h2>
  </button>
  <table v-show="isToggle">
    <thead>
      <tr>
        <th>画像</th>
        <th>野菜名</th>
        <th>販売単位</th>
        <th>単価</th>
        <th>卸先</th>
        <th>削除</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(elements, unique) in MyVegeData" :key="unique" class="uid">
        <MyVegeElement
        v-bind:-vege-data="elements"
        v-bind:unique="unique"
        v-on:delete-vege-data="deleteVegeData"
        ></MyVegeElement>
      </tr>
    </tbody>
  </table>
</template>
<style>
.uid {
  border: 1px solid black;
  padding-top: 20px;
}
.toggle-button {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}
</style>
