<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { getDatabase, ref as fireRef,  set } from 'firebase/database'
interface Props {
  vegeKeys: string[]
  vegeAllData: any
  selectVege: number[]
  selectMen: string[]
  selectMenUniqueList: string[]
  selectDate: Date | null
  vegeCount: number[]
  totalMoney: number[]
  allTotalMoney: number
  roadStation:string
}
interface Emits {
  (event: 'onStep', Next: boolean): void
  (event: 'onSend', isSend: boolean): void
}
function onStep(next: boolean) {
  if (!next) {
    emit('onStep', false)
  }
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const currentUser = ref<User | null>(null)
const vegeNameList = ref<string[]>([])
for (let i: number = 0; i < props.selectVege.length; i++) {
  vegeNameList.value[i] = props.vegeKeys[props.selectVege[i]]
}
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
     
    } else {
      currentUser.value = null
    }
  })
})
function writeVegeOrder(
  vege: string[],
  money: number[],
  num: number[],
  farmerName: string[],
  currentUser: User,
  date: Date | null,
  allTotalMoney: number,
  roadStation:string,
  unique:string[]
) {
  const now = parseTimestamp(getJSTTimestamp())
  const currentTime =
    now.year + '-' + now.month + '-' + now.day + '-' + now.hours + '-' + now.day + '-' + now.seconds
  
  const db = getDatabase()
  let unitList: string[] = []
  for (let i: number = 0; i < vege.length; i++) {
    unitList[i] = props.vegeAllData[vege[i]][props.selectMenUniqueList[i]].unit
  }
  
  if (!props.selectMenUniqueList || props.selectMenUniqueList.length !== vege.length) {
    
    return
  }

  set(fireRef(db, 'testOrders/' + roadStation+"/"+currentUser.uid + '/' + currentTime), {
    orderName: currentUser.displayName,
    email: currentUser.email,
    selectDate: date,
    totalMoney: allTotalMoney,
    state:"未連絡",
  })
    .then(() => {
      
    })
  for (let i: number = 0; i < vege.length; i++) {
    set(fireRef(db, 'testOrders/' + roadStation+"/"+ currentUser.uid + '/' + currentTime + '/' + i), {
      amount: num[i],
      farmerName: farmerName[i],
      price: money[i],
      unit: unitList[i],
      vegeName: vege[i],
      unique:unique[i]
    })
      .then(() => {
        
      })
  }
  emit('onSend', true)
}
function handleOrder() {
  if (currentUser.value) {
    writeVegeOrder(
      vegeNameList.value,
      props.totalMoney,
      props.vegeCount,
      props.selectMen,
      currentUser.value,
      props.selectDate,
      props.allTotalMoney,
      props.roadStation,
      props.selectMenUniqueList
    )
  } 
}
//タイムスタンプ文字列を変換
function parseTimestamp(timestamp: string) {
  const datePart = timestamp.split('T')[0]
  const timePart = timestamp.split('T')[1].replace('Z', '')

  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds, milliseconds] = timePart.split('-').map(Number)

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds
  }
}
function getJSTTimestamp() {
  const date = new Date()

  // JSTのオフセットはUTC+9時間
  const jstOffset = 9 * 60 * 60 * 1000

  // JSTに変換
  const jstDate = new Date(date.getTime() + jstOffset)

  // ISO 8601フォーマットに変換し、無効な文字を置き換える
  return jstDate.toISOString().replace(/[:.]/g, '-')
}
</script>
<template>
  <section>
    <h1>Step4</h1>
    <!-- v-for使うところって全部コンポーネント化した方がいいのか？ -->
    <article v-for="(element, index) in props.selectVege" v-bind:key="index" class="Step4_element">
      <h1>{{ props.vegeKeys[props.selectVege[index]] }}</h1>
      <h1>
        生産者：{{
          props.vegeAllData[props.vegeKeys[props.selectVege[index]]][selectMenUniqueList[index]].farmer
        }}
      </h1>
      <h3>
        単位:{{
          props.vegeAllData[props.vegeKeys[props.selectVege[index]]][selectMenUniqueList[index]].unit
        }}
      </h3>
      <h3>
        単価:{{
          props.vegeAllData[props.vegeKeys[props.selectVege[index]]][selectMenUniqueList[index]].en
        }}円
      </h3>
      <h1>何組：{{ props.vegeCount[index] }}組</h1>
    </article>

    <h1>希望日：{{ props.selectDate }}</h1>
    <h1>合計：{{ props.allTotalMoney }}円</h1>
    <button v-on:click="handleOrder" class="btn btn-primary">送信</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
</template>
<style>
.Step4_element {
  border: 1px solid gray;
  padding: 20px;
}
</style>
