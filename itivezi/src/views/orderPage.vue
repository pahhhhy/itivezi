<script setup lang="ts">
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase, ref, child, get, onValue, set, remove } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed } from 'vue'
import { idText } from 'typescript'
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

//Stepの管理
//ここら辺かなり無駄なことをしていそう。
const Stepnum = Vueref<number>(0)
const Step1error = Vueref<boolean>(false)
const Step2error = Vueref<boolean>(false)
const Step3error = Vueref<boolean>(false)
const Step1Num = Vueref<number>(0)
const Step2Num = Vueref<number>(0)
const SelectVege = Vueref<number>(0)
const SelectMen = Vueref<number>(0)
const selectedDate = Vueref<Date>()

// const now = new Date()
// const year = now.getFullYear()
// const month = Number(now.getMonth() + 1) // 月は0から始まるため+1
// const day = Number(now.getDate() + 1)
// const currentDate = Vueref<Date>(new Date(year, month, day))

function onStep(Next: boolean) {
  switch (Stepnum.value) {
    //Step1
    case 0:
      if (Step1Num.value == 0) {
        Step1error.value = true
      } else {
        Step1error.value = false
        if (Next) {
          Stepnum.value = Stepnum.value + 1
        }
      }
      break
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
      break
  }

  console.log(Stepnum.value)
}
function changeSelectNum() {
  switch (Stepnum.value) {
    case 0:
      SelectVege.value = Step1Num.value - 1
      break
    case 1:
      SelectMen.value = Step2Num.value - 1
      break
  }
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

  <div class="database">
    <h1>My Firebase</h1>
    <div v-if="vegeData == null">Loading…</div>
    <div v-else>{{ VegeAllData }}</div>
  </div>
  <div>{{ vegekeys }}</div>
  <h2>Step:{{ Stepnum }}</h2>
  <button v-on:click="writeVegedata('テスト野菜2', 100, 'testmememe', '100g')" class="writebutton">
    押すとデータが書き込まれるよ
  </button>
  <button v-on:click="DeleteVegedata('テスト野菜2')" class="writebutton">
    押すとデータが消されるよ
  </button>
  <!-- 野菜の選択 -->
  <section v-show="Stepnum == 0">
    <h1>野菜を選択してください</h1>
    <select
      class="form-select"
      aria-label="Default select example"
      v-model="Step1Num"
      v-on:change="changeSelectNum"
    >
      <option selected value="0" disabled hidden>野菜の選択してください</option>
      <option
        v-for="(Vegeelement, index) in vegekeys"
        v-bind:key="Vegeelement"
        v-bind:value="index + 1"
      >
        {{ Vegeelement }}
      </option>
    </select>
    <h1>{{ SelectVege }}</h1>
    <h2>Step1Num:{{ Step1Num }}</h2>
    <h1 style="color: red" v-show="Step1error && Step1Num == 0">野菜を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>

  <!-- 生産者の設定 -->
  <section v-show="Stepnum == 1">
    <h1>Step2</h1>
    <h1>{{ vegekeys[SelectVege] }}</h1>
    <select
      class="form-select"
      aria-label="Default select example"
      v-model="Step2Num"
      v-on:change="changeSelectNum"
    >
      <option selected value="0" disabled hidden>生産者の選択してください</option>
      <option
        v-for="(Vegeelement, index) in VegeAllData[vegekeys[SelectVege]]"
        v-bind:key="index"
        v-bind:value="index + 1"
      >
        {{ VegeAllData[vegekeys[SelectVege]][index].s }}
      </option>
    </select>
    <p>SelectMen：{{ SelectMen }}</p>
    <p>step2Num：{{ Step2Num }}</p>
    <p>野菜：{{ vegekeys[SelectVege] }}</p>
    <p>生産者：{{ VegeAllData[vegekeys[SelectVege]][SelectMen].s }}</p>
    <h3 v-show="Step2Num != 0">単位:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].unit }}</h3>
    <h3 v-show="Step2Num != 0">単価:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].en }}円</h3>
    <h1 style="color: red" v-show="Step2error && SelectMen == 0">生産者を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
  <!-- 日付・個数の指定 -->
  <section v-show="Stepnum == 2">
    <h1>Step3</h1>
    <h1>{{ vegekeys[SelectVege] }}</h1>
    <p>生産者：{{ VegeAllData[vegekeys[SelectVege]][SelectMen].s }}</p>
    <h3 v-show="Step2Num != 0">単位:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].unit }}</h3>
    <h3 v-show="Step2Num != 0">単価:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].en }}円</h3>
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
  <section v-show="Stepnum == 3">
    <!-- 確認・送信画面 -->
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
