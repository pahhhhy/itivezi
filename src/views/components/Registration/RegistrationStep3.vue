<script setup lang="ts">
import { ref } from 'vue'
import { type User } from 'firebase/auth'
import { getDatabase, ref as fireRef, onValue, push } from 'firebase/database'
interface Props {
  vegeKeys: string[]
  vegeList: number[]
  vegeMoneyList: number[]
  vegeAmountList: number[]
  vegeUnitList: number[]
  currentUser: User | null
}
interface Emits {
  (event: 'onStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
//この登録アルゴリズムでは上書き保存されてしまう可能性が大いにあるので直したい
function vegeWriteHandler() {
  if (props.currentUser?.displayName != null) {
    writeVege(
      props.vegeKeys,
      props.vegeList,
      props.vegeMoneyList,
      props.vegeAmountList,
      props.currentUser.displayName,
      props.vegeUnitList
    )
  } 
}
function onStep(next: boolean) {
  if (!next) emit('onStep', false)
}
const vegeData = ref<any>()
const finishSend = ref<boolean>(false)
const vegeUnitTempList = ref<string[]>(['g', 'kg', '本', '個'])
async function writeVege(
  vege: string[],
  selectedVege: number[],
  money: number[],
  num: number[],
  farmerVege: string,
  unit: number[]
) {
  let finishNum: number = 0
  const db = getDatabase()
  const unitTempList = ['g', 'kg', '本', '個']

  for (let i: number = 0; i < vege.length; i++) {
    let count = 0
    const countRef = fireRef(getDatabase(), 'testVege/' + vege[selectedVege[i]] + '/')
    onValue(countRef, (snapshot) => {
      vegeData.value = snapshot.val()

      count = vegeData.value ? Object.keys(vegeData.value).length : 0
      
    })
    const numWithUnit: string = num[i] + unitTempList[unit[i]]
    
    push(fireRef(db, 'testVege/' + vege[selectedVege[i]] ), {
      en: money[i],
      farmer: farmerVege,
      unit: numWithUnit
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
  <p>{{ props.vegeUnitList }}</p>

  <section>
    <div v-for="(vegeName, index) in props.vegeList" :key="vegeName + index" class="confirm">
      <h1>{{ vegeKeys[props.vegeList[index]] }}</h1>
      <h1>名前：{{ props.currentUser?.displayName }}</h1>
      <h1>
        単価：{{ props.vegeAmountList[index] }} {{ vegeUnitTempList[props.vegeUnitList[index]] }}
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
