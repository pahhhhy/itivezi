<script setup lang="ts">
import { ref as Vueref } from 'vue'
import { type User } from 'firebase/auth'
import { getDatabase, ref, onValue, set } from 'firebase/database'
interface Porps {
  vegekeys: string[]
  vegeList: number[]
  VegeMoneyList: number[]
  VegeAmoutList: number[]
  VegeTankaList: number[]
  currentUser: User | null
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
//この登録アルゴリズムでは上書き保存されてしまう可能性が多いにあるので直したい
function handlewritevege() {
  if (porps.currentUser?.displayName != null) {
    writeVege(
      porps.vegekeys,
      porps.vegeList,
      porps.VegeMoneyList,
      porps.VegeAmoutList,
      porps.currentUser.displayName,
      porps.VegeTankaList
    )
  } 
}
function onStep(Next: boolean) {
  if (!Next) emit('OnStep', false)
}
const vegeData = Vueref<any>()
const FinishSend = Vueref<boolean>(false)
const VegetankaTempList = Vueref<string[]>(['g', 'kg', '本', '個'])
async function writeVege(
  Vege: string[],
  selectvege: number[],
  money: number[],
  num: number[],
  farmername: string,
  tannka: number[]
) {
  let Finishnum: number = 0
  const db = getDatabase()
  const tankaTempList = ['g', 'kg', '本', '個']

  for (let i: number = 0; i < Vege.length; i++) {
    let count = 0
    const CountRef = ref(getDatabase(), 'testVege/' + Vege[selectvege[i]] + '/')
    onValue(CountRef, (snapshot) => {
      vegeData.value = snapshot.val()

      count = vegeData.value ? Object.keys(vegeData.value).length : 0
      
    })
    const unit: string = num[i] + tankaTempList[tannka[i]]
    
    set(ref(db, 'testVege/' + Vege[selectvege[i]] + '/' + count), {
      en: money[i],
      s: farmername,
      unit: unit
    })
      .then(() => {
        Finishnum++

        if (Finishnum == selectvege.length) {
          FinishSend.value = true
        }
      })
      
  }
}
const refreshPage = () => {
  location.reload() // 現在のページをリロード
}
</script>
<template>
  <p>{{ porps.VegeAmoutList }}</p>
  <p>{{ porps.vegeList }}</p>
  <p>{{ porps.VegeTankaList }}</p>

  <section>
    <div v-for="(Vegename, index) in porps.vegeList" :key="Vegename + index" class="confirm">
      <h1>{{ vegekeys[porps.vegeList[index]] }}</h1>
      <h1>名前：{{ porps.currentUser?.displayName }}</h1>
      <h1>
        単価：{{ porps.VegeAmoutList[index] }} {{ VegetankaTempList[porps.VegeTankaList[index]] }}
      </h1>
      <h1>価格：{{ VegeMoneyList[index] }}円</h1>
    </div>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="handlewritevege" class="btn btn-primary">送信</button>
  </section>
  <div class="card popup" style="width: 30rem" v-show="FinishSend">
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
