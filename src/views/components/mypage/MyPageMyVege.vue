<script setup lang="ts">
import { getDatabase, ref as fireRef, remove ,update} from 'firebase/database'
import { ref,watch} from 'vue'
import { type User } from 'firebase/auth'
import {useRoadStationStore}from "../../../stores/roadStation"
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
interface Props {
  currentUser: User
  vegeAllData: any
}
interface Emits {
  (event: 'initData'): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
async function deleteVegeData(vege: string, uid: string, RoadStation: string): Promise<void>  {
  const db = getDatabase();
  const path = 'testVege/' + RoadStation + "/" + vege + '/' + uid;
  // 更新するデータを指定
const updates = {
  state: "Discontinued"
};
  try {
    await update(fireRef(db, path), updates).then(() => {
      emit("initData")
    })
    
  } catch (error) {
    console.error("Error removing data:", error);
  }
}
const isToggle = ref<boolean>(false)
const isNull = ref<boolean[]>([])
function pushToggle() {
  isToggle.value = !isToggle.value;
 
}
// stateが"Discontinued"のアイテムを排除する関数
// 全部、型をanyでやってるの悪そうな感じがする
const filterDiscontinuedItems = (data:any) => {
  const filteredData:any = {};
  
  for (const [category, items] of Object.entries(data)as [any, any]) {
    const filteredItems:any = {};
    
    for (const [id, item] of Object.entries(items as any)as [string, any]) {
      if (item.state !== "Discontinued") {
        filteredItems[id] = item;
      }
    }
    
    if (Object.keys(filteredItems).length > 0) {
      filteredData[category] = filteredItems;
    }
  }
  
  return filteredData;
};
const targetList = ref<any>([])
const targetListKeys = ref<any>([])
//自分のデータを取得する。全探索を使うから時間がかかる
function findMyData(uid: string,roadData:any,index:number) {
  let vegeKeys:string[]=Object.keys(roadData)
  let countKey: number = vegeKeys.length
  let resultList: { [key: string]: string[] } = {}
  //iはkey(ほうれん草とか)の順番のこと
  for (let i: number = 0; i < countKey; i++) {
    let countElement: number = 0
    
    let key: string = vegeKeys[i]
    let uniqueKeys:string[]=Object.keys(roadData[vegeKeys[i]])
    
    if (uniqueKeys.length == undefined) countElement = 0
    else countElement = uniqueKeys.length
    //jはkeyの中にある要素の順番のこと
    for (let j: number = 0; j < countElement; j++) {
      const item = roadData[key][uniqueKeys[j]]
      
      if (item && item.uid === uid) {
        if (!resultList[key]) {
          resultList[key] = []
        }
        
        resultList[key].push(uniqueKeys[j])
      }
    }
  }
  
  targetList.value[index] = resultList
  targetListKeys.value[index] = Object.keys(resultList)
  isNull.value[index] = targetListKeys.value[index].length === 0;
}
function initData(){
  if (props.currentUser.displayName != null && props.vegeAllData != null){
    let countRoadStationKeys:number=roadStationUnitTempList.value.length
    for(let i:number=0;i<countRoadStationKeys;i++){
      let roadStationAllData:any=props.vegeAllData[roadStationUnitTempList.value[i]]
      roadStationAllData=filterDiscontinuedItems(roadStationAllData)
      findMyData(props.currentUser.uid,roadStationAllData,i)
    }
  }
}
watch(() => props.vegeAllData, () => {
  initData()
});
initData()
</script>
<template>
  <!-- {{props.vegeAllData}} -->
  <!-- {{ props.vegeAllData }} -->
  <!-- <h2>{{ targetList }}</h2> -->
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の野菜</h2>
  </button>
  <div v-for="(roadStationName,i) in roadStationUnitTempList" v-bind:key="roadStationName">
    <div class="nullvege" v-if="isToggle && isNull[i]">
      <h1>道の駅：{{roadStationName}}に登録した野菜はありません</h1>
    </div>
    <h1  v-show="isToggle&& !isNull[i]">{{roadStationName}}</h1>
    <div v-for="(elements, key) in targetList[i]" :key="key" class="uid" v-show="isToggle">
      <ul>
        <li v-for="index in elements.length" :key="index" class="py-2 px-2">
          key:{{ key }} index:{{ index }}uid:{{ elements[index - 1] }}
          <h3>
            何円：{{ props.vegeAllData[roadStationName]?.[key]?.[elements[index - 1]]?.en ?? 'N/A' }}円
            <button v-on:click="deleteVegeData(String(key), elements[index - 1], roadStationName)">
              <i class="bi bi-trash3"></i>
            </button>
          </h3>
          <h3>何組：{{ props.vegeAllData[roadStationName]?.[key]?.[elements[index - 1]]?.unit??"null" }}</h3>
        </li>
      </ul>
    </div>
  </div>
  
  
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
