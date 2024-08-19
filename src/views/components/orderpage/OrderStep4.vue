<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { getDatabase, ref as Fireref, child, get, onValue, set, remove } from 'firebase/database'
interface Porps {
  vegekeys: string[]
  vegealldata: { [key: string]: any[] }
  Selectvege: number[]
  SelectMen: string[]
  SelectMennum: number[]
  SelectDate: Date | null
  vegeCount: number[]
  Totalmoney: number[]
  allTotalmoney: number
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'OnSend', Issend: boolean): void
}
function onStep(Next: boolean) {
  if (!Next) {
    emit('OnStep', false)
  }
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
const currentUser = ref<User | null>(null)
const VegenameList = ref<string[]>([])
for (let i: number = 0; i < porps.Selectvege.length; i++) {
  VegenameList.value[i] = porps.vegekeys[porps.Selectvege[i]]
}
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      console.log('読み込みました')
    } else {
      currentUser.value = null
    }
  })
})
function writeVegeorder(
  Vege: string[],
  money: number[],
  num: number[],
  farmername: string[],
  currentUser: User,
  date: Date | null,
  alltotalmoney: number
) {
  const now = parseTimestamp(getJSTTimestamp())
  const currentTime =
    now.year + '-' + now.month + '-' + now.day + '-' + now.hours + '-' + now.day + '-' + now.seconds
  console.log(currentTime)
  const db = getDatabase()
  let unitlist: string[] = []
  for (let i: number = 0; i < Vege.length; i++) {
    unitlist[i] = porps.vegealldata[Vege[i]][porps.SelectMennum[i]].unit
  }
  console.log(unitlist)
  if (!porps.SelectMennum || porps.SelectMennum.length !== Vege.length) {
    console.error('SelectMennumが存在しないか、長さが一致していません')
    return
  }

  set(Fireref(db, 'testOrders/' + currentUser.uid + '/' + currentTime), {
    ordername: currentUser.displayName,
    email: currentUser.email,
    selectDate: date,
    totalmoney: alltotalmoney
  })
    .then(() => {
      console.log('注文の保存に完全に成功しました')
    })
    .catch((error) => {
      console.error('注文の最後の保存中にエラーが発生しました:', error)
    })
  for (let i: number = 0; i < Vege.length; i++) {
    set(Fireref(db, 'testOrders/' + currentUser.uid + '/' + currentTime + '/' + i), {
      amout: num[i],
      farmername: farmername[i],
      price: money[i],
      unit: unitlist[i],
      vegeName: Vege[i]
    })
      .then(() => {
        console.log('注文の保存に成功しました:', i)
      })
      .catch((error) => {
        console.error('注文のこの段階の保存中にエラーが発生しました:', i, error)
      })
  }
  emit('OnSend', true)
}
function handleOrder() {
  if (currentUser.value) {
    writeVegeorder(
      VegenameList.value,
      porps.Totalmoney,
      porps.vegeCount,
      porps.SelectMen,
      currentUser.value,
      porps.SelectDate,
      porps.allTotalmoney
    )
  } else {
    console.error('ユーザーが認証されていません。注文を保存できません。')
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
    <article v-for="(element, index) in porps.Selectvege" v-bind:key="index" class="Step4_element">
      <h1>{{ porps.vegekeys[porps.Selectvege[index]] }}</h1>
      <h1>
        生産者：{{
          porps.vegealldata[porps.vegekeys[porps.Selectvege[index]]][SelectMennum[index]].s
        }}
      </h1>
      <h3>
        単位:{{
          porps.vegealldata[porps.vegekeys[porps.Selectvege[index]]][SelectMennum[index]].unit
        }}
      </h3>
      <h3>
        単価:{{
          porps.vegealldata[porps.vegekeys[porps.Selectvege[index]]][SelectMennum[index]].en
        }}円
      </h3>
      <h1>何組：{{ porps.vegeCount[index] }}組</h1>
    </article>

    <h1>希望日：{{ porps.SelectDate }}</h1>
    <h1>合計：{{ porps.allTotalmoney }}円</h1>
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
