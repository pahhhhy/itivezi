<script setup lang="ts">
import { ref as vueRef } from 'vue'
import { type User } from 'firebase/auth'
import { getDatabase, ref, onValue, set } from 'firebase/database'
interface Porps {
  vegeKeys: string[]
  vegeList: number[]
  vegeMoneyList: number[]
  vegeAmountList: number[]
  vegeTankaList: number[]
  currentUser: User | null
}
interface Emits {
  (event: 'onStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Porps>()
//この登録アルゴリズムでは上書き保存されてしまう可能性が多いにあるので直したい
function vegeWriteHandler() {
  if (props.currentUser?.displayName != null) {
    writeVege(
      props.vegeKeys,
      props.vegeList,
      props.vegeMoneyList,
      props.vegeAmountList,
      props.currentUser.displayName,
      props.vegeTankaList
    )
  } 
}
function onStep(next: boolean) {
  if (!next) emit('onStep', false)
}
const vegeData = vueRef<any>()
const finishSend = vueRef<boolean>(false)
const vegeTankaTempList = vueRef<string[]>(['g', 'kg', '本', '個'])
async function writeVege(
  vege: string[],
  selectedVege: number[],
  money: number[],
  num: number[],
  farmerVege: string,
  tannka: number[]
) {
  let finishNum: number = 0
  const db = getDatabase()
  const tankaTempList = ['g', 'kg', '本', '個']

  for (let i: number = 0; i < vege.length; i++) {
    let count = 0
    const countRef = ref(getDatabase(), 'testVege/' + vege[selectedVege[i]] + '/')
    onValue(countRef, (snapshot) => {
      vegeData.value = snapshot.val()

      count = vegeData.value ? Object.keys(vegeData.value).length : 0
      
    })
    const unit: string = num[i] + tankaTempList[tannka[i]]
    
    set(ref(db, 'testVege/' + vege[selectedVege[i]] + '/' + count), {
      en: money[i],
      s: farmerVege,
      unit: unit
    })
      .then(() => {
        finishNum++

        if (finishNum == selectedVege.length) {
          finishSend.value = true
        }
      })
      
  }
}
const refreshPage = () => {
  location.reload() // 現在のページをリロード
}
</script>
<template>
  <p>{{ props.vegeAmountList }}</p>
  <p>{{ props.vegeList }}</p>
  <p>{{ props.vegeTankaList }}</p>

  <section>
    <div v-for="(vegeName, index) in props.vegeList" :key="vegeName + index" class="confirm">
      <h1>{{ vegeKeys[props.vegeList[index]] }}</h1>
      <h1>名前：{{ props.currentUser?.displayName }}</h1>
      <h1>
        単価：{{ props.vegeAmountList[index] }} {{ vegeTankaTempList[props.vegeTankaList[index]] }}
      </h1>
      <h1>価格：{{ vegeMoneyList[index] }}円</h1>
    </div>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="vegeWriteHandler" class="btn btn-primary">送信</button>
  </section>
  <div class="card popup" style="width: 30rem" v-show="finishSend">
    <div class="card-body">
      <h5 class="card-title">送信が完了しました</h5>
      <button v-on:click="refreshPage" class="btn btn-primary">初めに戻る</button>
    </div>
  </div>
</template>
<style>
.confirm {
  border: 1px solid gray;
  border-radius: 10px;
  margin: 0 55px;
}
</style>
