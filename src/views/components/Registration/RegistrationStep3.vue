<script setup lang="ts">
import { ref } from 'vue'
import { type User } from 'firebase/auth'
import { getDatabase, ref as fireRef, push } from 'firebase/database'
interface Props {
  vegeKeys: string[]
  vegeList: number[]
  vegeMoneyList: number[]
  vegeAmountList: number[]
  vegeUnitList: string[]
  currentUser: User | null
  roadStation:string
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
      props.vegeUnitList,
      props.currentUser.uid,
      props.roadStation
    )
  } 
}
function onStep(next: boolean) {
  if (!next) emit('onStep', false)
}
const finishSend = ref<boolean>(false)
async function writeVege(
  vege: string[],
  selectedVege: number[],
  money: number[],
  num: number[],
  farmerVege: string,
  unit: string[],
  uid:string,
  road:string
) {
  let finishNum: number = 0
  const db = getDatabase()
  for (let i: number = 0; i < vege.length; i++) {
    const numWithUnit: string = num[i] + unit[i]
    push(fireRef(db, 'testVege/' +road+"/"+ vege[selectedVege[i]] ), {
      en: money[i],
      farmer: farmerVege,
      unit: numWithUnit,
      uid:uid,
      state:"Available"
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
  <!-- <p>{{ props.vegeAmountList }}</p>
  <p>{{ props.vegeList }}</p>
  <p>{{ props.vegeUnitList }}</p> -->

  <section>
    <div v-for="(vegeName, index) in props.vegeList" :key="vegeName + index" class="confirm">
      <h1>{{ vegeKeys[props.vegeList[index]] }}</h1>
      <h1>名前：{{ props.currentUser?.displayName }}</h1>
      <h1>
        単価：{{ props.vegeAmountList[index] }} {{ props.vegeUnitList[index] }}
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
