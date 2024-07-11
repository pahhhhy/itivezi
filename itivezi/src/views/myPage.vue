<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import { getDatabase, ref, child, get, onValue, set, remove } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed, onMounted, watch } from 'vue'
function ReadData(element: string) {
  const CountRef = ref(getDatabase(), 'testVege/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}
const targetname = Vueref<string>('三浦涼太郎')
const vegeAllData = Vueref<any>(ReadData(''))
const vegekeys = computed(() => {
  return vegeAllData.value ? Object.keys(vegeAllData.value) : []
})
watch(vegeAllData, (newVal) => {
  if (newVal) {
    FindMyData(targetname.value, newVal)
  }
})
// 今は一番後ろのデータをけすようにしている
function DeleteVegedata(Vege: string, count: number) {
  const db = getDatabase()
  remove(ref(db, 'testVege/' + Vege + '/' + count))
}
const countKeys = (obj: object): number => {
  return Object.keys(obj).length
}
const targetList = Vueref<any>(null)
const targetListKeys = Vueref<string[]>()
//自分のデータを取得する。全探索を使うから時間がかかる
function FindMyData(element: string, AllData: any) {
  const CountKey = countKeys(vegeAllData.value)
  console.log(vegeAllData)
  let resultList: { [key: string]: number[] } = {}
  //iはkey(ほうれん草とか)の順番のこと
  for (let i: number = 0; i < CountKey; i++) {
    let Countelement = AllData[vegekeys.value[i]].length
    let key: string = vegekeys.value[i]
    //jはkeyの中にある要素の順番のこと
    for (let j: number = 0; j < Countelement; j++) {
      const item = AllData[key][j]
      if (item && item.s === element) {
        if (!resultList[key]) {
          resultList[key] = []
        }
        console.log(key)
        resultList[key].push(j)
      }
    }
  }
  targetList.value = resultList
  targetListKeys.value = Object.keys(resultList)
}

// データを再読み込みする関数
function reloadData() {
  vegeAllData.value = ReadData('')
  FindMyData(targetname.value, vegeAllData)
}
</script>

<template>
  <div class="title">
    <h1>マイページ</h1>
  </div>

  <p><RouterLink v-bind:to="{ name: 'orderpage' }">注文</RouterLink></p>
  {{ vegeAllData }}
  <h1>{{ targetList }}</h1>
  <h1>{{ targetname }}</h1>
  <h1>{{ targetListKeys }}</h1>
  <div v-for="(elements, key) in targetList" :key="key" class="element">
    <h2>{{ key }}</h2>
    <ul>
      <li v-for="index in elements.length" :key="index" class="py-2 px-2">
        key:{{ key }} index:{{ index }}element:{{ elements[index - 1] }}
        <h3>
          何円：{{ vegeAllData[key][elements[index - 1]].en }}円
          <button @click="() => DeleteVegedata(String(key), elements[index - 1])">
            <i class="bi bi-trash3"></i>
          </button>
        </h3>
        <h3>何組：{{ vegeAllData[key][elements[index - 1]].unit }}</h3>
      </li>
    </ul>
  </div>
</template>
<style>
.title {
  text-align: center;
}
.element {
  border: 1px solid black;
  padding-top: 20px;
}
</style>
