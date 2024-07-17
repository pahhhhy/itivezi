<script setup lang="ts">
import { getDatabase, ref, child, get, onValue, set, remove } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed } from 'vue'

import OrderStep1 from './components/orderpage/OrderStep1.vue'
import OrderStep2 from './components/orderpage/OrderStep2.vue'
const vegeData = Vueref<any>(ReadData('テスト野菜2'))
const VegeAllData = Vueref<any>(ReadData(''))

const vegekeys = computed(() => {
  return VegeAllData.value ? Object.keys(VegeAllData.value) : []
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
function writeVegedata(path: string, Vege: string, en: number, s: string, unit: string) {
  let count = 0
  const CountRef = ref(getDatabase(), path + '/' + Vege)
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
const FinishSend = Vueref<boolean>(false)
function writeVegeorder(
  Vege: string,
  money: number,
  date: Date | null,
  num: number,
  farmername: string,
  unit: number
) {
  let count = 0
  const CountRef = ref(getDatabase(), 'testOrders/')
  onValue(CountRef, (snapshot) => {
    vegeData.value = snapshot.val()

    count = vegeData.value ? Object.keys(vegeData.value).length : 0
    console.log(count)
  })
  const db = getDatabase()

  set(ref(db, 'testOrders/' + count), {
    amout: num,
    farmername: farmername,
    price: money,
    unit: unit,
    vegeName: Vege,
    SelectDate: date
  })
    .then(() => {
      FinishSend.value = true
    })
    .catch((error) => {
      console.error('注文の保存中にエラーが発生しました:', error)
    })
}
//変数すべてをリセットする

const refreshPage = () => {
  location.reload() // 現在のページをリロード
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

//Stepの管理
//ここら辺かなり無駄なことをしていそう。
const Stepnum = Vueref<number>(0)

const Step2error = Vueref<boolean>(false)
const Step3error = Vueref<boolean>(false)
const Step2Num = Vueref<number>(0)
const SelectVegelist = Vueref<number[]>([])
const SelectVege = Vueref<number>(0)
const SelectMen = Vueref<number>(0)
const SelectMenlist = Vueref<string[]>([])
const selectedDate = Vueref<Date | null>(null)
function OnStep(Next: boolean) {
  console.log('oya')
  if (Next) {
    Stepnum.value = Stepnum.value + 1
  } else {
    Stepnum.value = Stepnum.value - 1
  }
}
//子要素からのデータの受け取り
function changeVege(element: number[]) {
  SelectVegelist.value = element
}
function chagemen(element: string[]) {
  SelectMenlist.value = element
}
function onStep(Next: boolean) {
  switch (Stepnum.value) {
    //Step2
    case 1:
      if (!Next) {
        Stepnum.value = Stepnum.value - 1
      } else if (Step2Num.value == 0) {
        Step2error.value = true
      } else {
        Step2error.value = false
        if (Next) {
          Stepnum.value = Stepnum.value + 1
        }
      }
      break
    //Step3
    case 2:
      //戻る時は何も分岐なし
      if (!Next) {
        Stepnum.value = Stepnum.value - 1
      }
      //何か選択してないものがある時にエラー文を出すようにしたい
      if (vegetableCount.value == 0 || selectedDate.value == null) {
        Step3error.value = true
      } else {
        Step3error.value = false
        if (Next) {
          Stepnum.value = Stepnum.value + 1
        }
      }
      break
    //Step4
    case 3:
      if (!Next) {
        Stepnum.value = Stepnum.value - 1
      }
      break
  }

  console.log(Stepnum.value)
}

//金額の計算とか
const vegetableCount = Vueref<number>(0)
const Totalmoney = Vueref<number>(0)
function changeMoney(money: number) {
  Totalmoney.value = vegetableCount.value * money
}
</script>

<template>
  <div class="title">
    <h1>注文画面</h1>
  </div>
  <!-- <h2>{{ VegeAllData }}</h2> -->
  <!-- <h2>{{ SelectVegelist }}</h2> -->
  <OrderStep1
    v-bind:vegekeys="vegekeys"
    v-bind:SelectVegelist="SelectVegelist"
    v-on:OnStep="OnStep"
    v-on:changeVege="changeVege"
    v-if="Stepnum == 0"
  ></OrderStep1>

  <!-- 生産者の設定 -->
  <OrderStep2
    v-bind:vegealldata="VegeAllData"
    v-bind:Selectvege="SelectVegelist"
    v-bind:-selectmen="SelectMenlist"
    v-bind:vegekeys="vegekeys"
    v-on:OnStep="OnStep"
    v-on:changemen="chagemen"
    v-if="Stepnum == 1"
  ></OrderStep2>
  <!-- 日付・個数の指定 -->
  <section v-if="Stepnum == 2">
    <h1>Step3</h1>
    <article v-for="(element, index) in SelectVege" v-bind:key="index">
      <h1>{{ vegekeys[element] }}</h1>
      <p>生産者：{{ VegeAllData[vegekeys[SelectVege]][SelectMen].s }}</p>
      <h3 v-show="Step2Num != 0">単位:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].unit }}</h3>
      <h3 v-show="Step2Num != 0">単価:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].en }}円</h3>
    </article>

    <!-- スクロールで値が変わるのと０以下を書くことができるのがまずい -->
    <input
      class="form-control"
      type="number"
      placeholder="何組買いますか？"
      aria-label="default input example"
      v-model="vegetableCount"
      v-on:change="changeMoney(VegeAllData[vegekeys[SelectVege]][SelectMen].en)"
    />
    <h1>何組：{{ vegetableCount }}組</h1>
    <h1>合計：{{ Totalmoney }}円</h1>
    <h1 style="color: red" v-show="Step3error && vegetableCount == 0">個数を指定してください</h1>
    <!-- 今日より前を選択不可にしないと -->
    <VueDatePicker
      v-model="selectedDate"
      format="yyyy/MM/dd"
      locale="ja"
      model-type="yyyy-MM-dd"
      week-start="0"
      :enable-time-picker="false"
      auto-apply
      no-today
    />
    <h1>{{ selectedDate }}</h1>
    <h1 style="color: red" v-show="Step3error && selectedDate == null">日付を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
  <!-- 確認・送信画面 -->
  <section v-show="Stepnum == 3">
    <h1>Step4</h1>
    <h1>{{ vegekeys[SelectVege] }}</h1>
    <h1>生産者：{{ VegeAllData[vegekeys[SelectVege]][SelectMen].s }}</h1>
    <h3 v-show="Step2Num != 0">単位:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].unit }}</h3>
    <h3 v-show="Step2Num != 0">単価:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].en }}円</h3>
    <h1>何組：{{ vegetableCount }}組</h1>
    <h1>希望日：{{ selectedDate }}</h1>
    <h1>合計：{{ Totalmoney }}円</h1>
    <button
      v-on:click="
        writeVegeorder(
          vegekeys[SelectVege],
          Totalmoney,
          selectedDate,
          vegetableCount,
          VegeAllData[vegekeys[SelectVege]][SelectMen].s,
          VegeAllData[vegekeys[SelectVege]][SelectMen].unit
        )
      "
      class="btn btn-primary"
    >
      送信
    </button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
  <div class="card popup" style="width: 30rem" v-show="FinishSend">
    <div class="card-body">
      <h5 class="card-title">送信が完了しました</h5>
      <button v-on:click="refreshPage" class="btn btn-primary">初めに戻る</button>
    </div>
  </div>
</template>
<style>
.popup {
  position: absolute !important;
  top: 30%;
  left: 30%;
  z-index: 1;
}
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
