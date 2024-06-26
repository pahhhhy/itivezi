<script setup lang="ts">
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase, ref, child, get, onValue, set, remove } from 'firebase/database'
import { ref as Vueref, computed } from 'vue'
const vegeData = Vueref<any>(ReadData('テスト野菜2'))
const vegename = Vueref<any>(ReadData(''))
const SelectVege = Vueref(null)
const vegekeys = computed(() => {
  return vegename.value ? Object.keys(vegename.value) : []
})
//読みこむデータの指定
function ReadData(element: string) {
  const CountRef = ref(getDatabase(), 'testVege/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}

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
const Stepnum = Vueref<number>(0)
const Step1error = Vueref<boolean>(false)
function onStep(Next: boolean) {
  if (SelectVege.value == null) {
    Step1error.value = true
  } else {
    Step1error.value = false
    if (Next) {
      Stepnum.value = Stepnum.value + 1
    } else {
      Stepnum.value = Stepnum.value - 1
    }
  }

  console.log(Stepnum.value)
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
  <div>{{ vegekeys }}</div>
  <button v-on:click="writeVegedata('テスト野菜2', 100, 'testmememe', '100g')" class="writebutton">
    押すとデータが書き込まれるよ
  </button>
  <button v-on:click="DeleteVegedata('テスト野菜2')" class="writebutton">
    押すとデータが消されるよ
  </button>
  <!-- 野菜の選択 -->
  <section v-show="Stepnum == 0">
    <h1>野菜を選択してください</h1>
    <select class="form-select" aria-label="Default select example" v-model="SelectVege">
      <option
        v-for="(Vegeelement, index) in vegekeys"
        v-bind:key="Vegeelement"
        v-bind:value="index"
      >
        {{ Vegeelement }}
      </option>
    </select>
    <h1>{{ SelectVege }}</h1>
    <h1 style="color: red" v-show="Step1error && SelectVege == null">野菜を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>

  <!-- 生産者の設定 -->
  <section v-show="Stepnum == 1">
    <h1>Step2</h1>

    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
  <section v-show="Stepnum == 2">
    <h1>Step3</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
  <section v-show="Stepnum == 3">
    <h1>Step4</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
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
