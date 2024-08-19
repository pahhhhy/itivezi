<script setup lang="ts">
import { getDatabase, ref as fireRef, remove } from 'firebase/database'
import { ref, watch } from 'vue'
import { type User } from 'firebase/auth'
interface Props {
  currentUser: User
  vegeKeys: string[]
  vegeAllData: any
}
const props = defineProps<Props>()
function deleteVegeData(vege: string, count: number) {
  const db = getDatabase()
  const path = 'testVege/' + vege + '/' + count
  remove(fireRef(db, path))
    .then(() => {
      
    })
    
}

const isToggle = ref<boolean>(false)
const isNull = ref<boolean>(false)
function pushToggle() {
  isToggle.value = !isToggle.value;
 
}
const countKeys = (obj: object): number => {
  return Object.keys(obj).length
}

const targetList = ref<any>(null)
const targetListKeys = ref<string[]>([])
//自分のデータを取得する。全探索を使うから時間がかかる
function findMyData(element: string) {
  const countKey: number = countKeys(props.vegeAllData)
  
  let resultList: { [key: string]: string[] } = {}
  //iはkey(ほうれん草とか)の順番のこと
  for (let i: number = 0; i < countKey; i++) {
    let countElement: number = 0
    
    let key: string = props.vegeKeys[i]
    let uniqueKeys:string[]=Object.keys(props.vegeAllData[props.vegeKeys[i]])
    if (uniqueKeys.length == undefined) countElement = 0
    else countElement = uniqueKeys.length
    //jはkeyの中にある要素の順番のこと
    for (let j: number = 0; j < countElement; j++) {
      const item = props.vegeAllData[key][uniqueKeys[j]]
      if (item && item.farmer === element) {
        if (!resultList[key]) {
          resultList[key] = []
        }
        
        resultList[key].push(uniqueKeys[j])
      }
    }
  }
  isNull.value = Object.keys(resultList).length === 0;
  targetList.value = resultList
  targetListKeys.value = Object.keys(resultList)
}
if (props.currentUser.displayName != null && props.vegeAllData != undefined)
  findMyData(props.currentUser.displayName)

watch(
  () => props.vegeAllData,
  () => {
    if (props.currentUser.displayName != null) {
      findMyData(props.currentUser.displayName)
    }
  }
)
</script>
<template>
  <!-- {{ props.vegeAllData }} -->
  <!-- <h2>{{ targetList }}</h2> -->
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の野菜</h2>
  </button>
  <div class="nullvege" v-if="isToggle && isNull">
    <h1>登録した野菜はありません</h1>
  </div>
  <div v-for="(elements, key) in targetList" :key="key" class="element" v-show="isToggle">
    <ul>
      <li v-for="index in elements.length" :key="index" class="py-2 px-2">
        key:{{ key }} index:{{ index }}element:{{ elements[index - 1] }}
        <h3>
          何円：{{ props.vegeAllData[key][elements[index - 1]].en }}円
          <button @click="() => deleteVegeData(String(key), elements[index - 1])">
            <i class="bi bi-trash3"></i>
          </button>
        </h3>
        <h3>何組：{{ props.vegeAllData[key][elements[index - 1]].unit }}</h3>
      </li>
    </ul>
  </div>
</template>
<style>
.element {
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
