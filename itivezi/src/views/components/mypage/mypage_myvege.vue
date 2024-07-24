<script setup lang="ts">
import { getDatabase, ref as Fireref, remove } from 'firebase/database'
import { ref as Vueref } from 'vue'
import { type User } from 'firebase/auth'
interface Porps {
  currentUser: User
  vegekeys: string[]
  vegealldata: { [key: string]: any[] }
}
interface Emits {
  (event: 'reloadData'): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
function DeleteVegedata(Vege: string, count: number) {
  const db = getDatabase()
  const path = 'testVege/' + Vege + '/' + count
  console.log(path)
  remove(Fireref(db, path))
  emit('reloadData')
}

const IsToggle = Vueref<boolean>(false)
const Isnull = Vueref<boolean>(false)
function Pushtoggle() {
  if (IsToggle.value) IsToggle.value = false
  else IsToggle.value = true
}
const countKeys = (obj: object): number => {
  return Object.keys(obj).length
}

const targetList = Vueref<any>(null)
const targetListKeys = Vueref<string[]>([])
//自分のデータを取得する。全探索を使うから時間がかかる
function FindMyData(element: string) {
  const CountKey: number = countKeys(porps.vegealldata)
  let resultList: { [key: string]: number[] } = {}

  //iはkey(ほうれん草とか)の順番のこと
  for (let i: number = 0; i < CountKey; i++) {
    let Countelement = porps.vegealldata[porps.vegekeys[i]].length
    let key: string = porps.vegekeys[i]
    //jはkeyの中にある要素の順番のこと
    for (let j: number = 0; j < Countelement; j++) {
      const item = porps.vegealldata[key][j]
      if (item && item.s === element) {
        if (!resultList[key]) {
          resultList[key] = []
        }
        console.log(key)
        resultList[key].push(j)
      }
    }
  }
  if (resultList.length == undefined) Isnull.value = true
  else Isnull.value = false
  console.log(Isnull.value)
  targetList.value = resultList
  targetListKeys.value = Object.keys(resultList)
}
if (porps.currentUser.displayName != null) FindMyData(porps.currentUser.displayName)
else console.error('ミスってる')
</script>
<template>
  <button v-on:click="Pushtoggle()" class="Tbutton">
    <i class="bi bi-caret-down-fill" v-show="!IsToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="IsToggle"></i>
    <h2>自分の野菜</h2>
  </button>
  <div class="nullvege" v-if="IsToggle && Isnull == true">
    <h1>登録した野菜はありません</h1>
  </div>
  <div v-for="(elements, key) in targetList" :key="key" class="element" v-show="IsToggle">
    <h2>{{ key }}</h2>
    <p>{{ elements }}</p>
    <ul>
      <li v-for="index in elements.length" :key="index" class="py-2 px-2">
        key:{{ key }} index:{{ index }}element:{{ elements[index - 1] }}
        <h3>
          何円：{{ porps.vegealldata[key][elements[index - 1]].en }}円
          <button @click="() => DeleteVegedata(String(key), elements[index - 1])">
            <i class="bi bi-trash3"></i>
          </button>
        </h3>
        <h3>何組：{{ porps.vegealldata[key][elements[index - 1]].unit }}</h3>
      </li>
    </ul>
  </div>
</template>
<style>
.element {
  border: 1px solid black;
  padding-top: 20px;
}
.Tbutton {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}
</style>
