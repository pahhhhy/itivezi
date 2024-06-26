<script setup lang="ts">
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase, ref, child, get, onValue, set, remove } from 'firebase/database'
import { ref as Vueref } from 'vue'
const vegeData = Vueref<any>(null)
// アナリティクスの初期化
const dbRef = ref(getDatabase())
//読みこむデータの指定
const CountRef = ref(getDatabase(), 'testVege/テスト野菜2')
onValue(CountRef, (snapshot) => {
  vegeData.value = snapshot.val()
})
//指定したデータを書き込むようにしている。Vegeに該当の野菜
function writeVegedata(Vege: string, en: number, s: string, unit: string) {
  let count = 0
  const CountRef = ref(getDatabase(), 'testVege/' + Vege)
  onValue(CountRef, (snapshot) => {
    vegeData.value = snapshot.val()

    count = vegeData.value ? Object.keys(vegeData.value).length : 0
    console.log(count)
  })
  const db = getDatabase()

  set(ref(db, 'testVege/' + Vege + '/' + count), {
    en: en,
    s: s,
    unit: unit
  })
}
// 今は一番後ろのデータをけすようにしている
function DeleteVegedata(Vege: string) {
  let count = 0
  const CountRef = ref(getDatabase(), 'testVege/' + Vege)
  onValue(CountRef, (snapshot) => {
    vegeData.value = snapshot.val()

    count = vegeData.value ? Object.keys(vegeData.value).length : 0
    console.log(count)
  })
  const db = getDatabase()
  count = count - 1
  remove(ref(db, 'testVege/' + Vege + '/' + count))
}
</script>

<template>
  <div class="title">
    <h1>注文画面</h1>
  </div>

  <div class="database">
    <h1>My Firebase</h1>
    <div v-if="vegeData == null">Loading…</div>
    <div v-else>{{ vegeData }}</div>
  </div>
  <button v-on:click="writeVegedata('テスト野菜2', 100, 'testmememe', '100g')" class="writebutton">
    押すとデータが書き込まれるよ
  </button>
  <button v-on:click="DeleteVegedata('テスト野菜2')" class="writebutton">
    押すとデータが消されるよ
  </button>
</template>
<style>
.title {
  text-align: center;
}
.database {
  display: flex;
  align-items: center;
  justify-content: center;
}
.writebutton {
  width: 200px;
  height: 100px;
  margin: auto;
}
</style>
