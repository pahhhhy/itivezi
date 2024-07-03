<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { getDatabase, ref, child, get, onValue, set, remove } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed } from 'vue'
function ReadData(element: string) {
  const CountRef = ref(getDatabase(), 'testVege/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}

const vegeAllData = Vueref<any>(ReadData(''))
const vegekeys = computed(() => {
  return vegeAllData.value ? Object.keys(vegeAllData.value) : []
})
// 今は一番後ろのデータをけすようにしている
function DeleteVegedata(Vege: string) {
  let count = 0
  const db = getDatabase()
  count = count - 1
  remove(ref(db, 'testVege/' + Vege + '/' + count))
}
const countKeys = (obj: object): number => {
  return Object.keys(obj).length
}
//自分のデータを取得する。全探索を使うから時間がかかる
function FindMyData(element: string) {
  const CountKey = countKeys(vegeAllData.value)
  let resultList: { [key: number]: number[] } = {}
  //iはkey(ほうれん草とか)の順番のこと
  for (let i: number = 0; i < CountKey; i++) {
    let Countelement = vegeAllData.value[i].length
    const key = vegekeys.value[i]
    //jはkeyの中にある要素の順番のこと
    for (let j: number = 0; j < Countelement; j++) {
      const item = vegeAllData.value[key][j]
      if (item && item.s === element) {
        if (!resultList[i]) {
          resultList[i] = []
        }
        resultList[i].push(j)
      }
    }
  }
  return resultList
}
// const targetList = Vueref<any>(FindMyData('三浦涼太郎'))
</script>

<template>
  <div class="title">
    <h1>マイページ</h1>
  </div>

  <p><RouterLink v-bind:to="{ name: 'orderpage' }">注文</RouterLink></p>
  {{ vegeAllData }}
</template>
<style>
.title {
  text-align: center;
}
</style>
