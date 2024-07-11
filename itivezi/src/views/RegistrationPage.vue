<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getDatabase, ref, child, get, onValue, set, remove } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed } from 'vue'
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
const FinishSend = Vueref<boolean>(false)

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
      console.log(count)
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
      .catch((error) => {
        console.error('注文の保存中にエラーが発生しました:', error)
      })
  }
}

//変数すべてをリセットする

const refreshPage = () => {
  location.reload() // 現在のページをリロード
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
const selectedDate = Vueref<Date | null>(null)
function onStep(Next: boolean) {
  switch (Stepnum.value) {
    //Step1
    case 0:
      if (VegeList.value.length == 0) {
        Step1error.value = true
      } else {
        Step1error.value = false
        if (Next) {
          Stepnum.value = Stepnum.value + 1

          VegeMoneyList.value = new Array(VegeList.value.length).fill(0)
          VegetankaList.value = new Array(VegeList.value.length).fill(0)
          VegeamoutList.value = new Array(VegeList.value.length).fill(0)
        }
      }
      break
    //Step2
    case 1:
      if (!Next) {
        Stepnum.value = Stepnum.value - 1
      } else if (ErrorFind()) {
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
      if (selectedDate.value == null) {
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

const VegeList = Vueref<number[]>([])
function changeSelectNum() {
  switch (Stepnum.value) {
    case 0:
      SelectVege.value = Step1Num.value - 1
      if (!VegeList.value.includes(SelectVege.value)) {
        VegeList.value.push(SelectVege.value)
      }
      break
    case 1:
      SelectMen.value = Step2Num.value - 1
      break
  }
}
function DeleteSelecetNum(Vegename: number) {
  switch (Stepnum.value) {
    case 0:
      VegeList.value = VegeList.value.filter((item) => item !== Vegename)
      break
    case 1:
      SelectMen.value = Step2Num.value - 1
      break
  }
}
function ErrorFind() {
  const IsMoneyList: boolean =
    VegeMoneyList.value.length != VegeList.value.length ||
    VegeMoneyList.value.some((item) => item === '') || //inputで値を打った後に消すと空文字ができてしまうからそれを判定するため
    VegeMoneyList.value.some((item) => item === 0)
  const IsVegeamoutList: boolean =
    VegeamoutList.value.length != VegeList.value.length ||
    VegeamoutList.value.some((item) => item === '') ||
    VegeamoutList.value.some((item) => item === 0)
  const IsVegetankaList: boolean = VegeamoutList.value.some((item) => item === 0)

  const Iserror = IsMoneyList || IsVegeamoutList || IsVegetankaList
  console.log(
    IsMoneyList + ' :amout' + IsVegeamoutList + ' :tanka' + IsVegetankaList + ' :error' + Iserror
  )
  return Iserror
}
const VegeMoneyList = Vueref<number[]>([])
const VegeamoutList = Vueref<number[]>([])
const VegetankaList = Vueref<number[]>([])
const VegetankaTempList = Vueref<string[]>(['g', 'kg', '本', '個'])
function updateVegeMoney(value: number, index: number) {
  // マイナスの値になることを防ぐ
  if (value < 0) {
    VegeMoneyList.value[index] = 0
  } else if (VegeMoneyList.value.some((item) => item === '')) {
    VegeMoneyList.value[index] = 0
  } else {
    VegeMoneyList.value[index] = value
  }
  console.log()
}
</script>

<template>
  <div class="title">
    <h1>登録</h1>
  </div>

  <p><RouterLink v-bind:to="{ name: 'orderpage' }">注文</RouterLink></p>
  <h1>Stepnum:{{ Stepnum }}</h1>
  <section v-show="Stepnum == 0">
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
    <h1>{{ VegeList }}</h1>
    <h1 v-for="Vegename in VegeList" v-bind:key="Vegename">
      {{ vegekeys[Vegename] }}
      <button v-on:click="DeleteSelecetNum(Vegename)"><i class="bi bi-trash3"></i></button>
    </h1>
    <h1 style="color: red" v-show="Step1error && VegeList.length == 0">野菜を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
  <section v-show="Stepnum == 1">
    <h1 v-for="(Vegename, index) in VegeList" :key="Vegename + index">
      {{ vegekeys[Vegename] }}
      <div class="tanka">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="VegeamoutList[index]"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="VegetankaList[index]"
        >
          <!-- 選択式ではなく野菜を決めた時点でその野菜に対応した単位を決めてしまった方が良かった -->
          <option selected value="0" disabled hidden>単位</option>
          <option
            v-for="(Vegename, index) in VegetankaTempList"
            :key="Vegename"
            v-bind:value="index + 1"
          >
            {{ VegetankaTempList[index] }}
          </option>
        </select>
      </div>

      <input
        class="form-control"
        type="number"
        placeholder="何円にしますか？"
        aria-label="default input example"
        v-model="VegeMoneyList[index]"
        @input="updateVegeMoney(VegeMoneyList[index], index)"
      />
    </h1>
    <h3>vegelist{{ VegeList.length }}</h3>
    <h4>money{{ VegeMoneyList.length }}</h4>
    <h1>{{ VegeMoneyList }}</h1>
    <h1>単価：{{ VegeamoutList }}</h1>
    <h1>単位：{{ VegetankaList }}</h1>
    <h1 style="color: red" v-show="ErrorFind()">全ての価格を設定してください</h1>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
  <!-- 送信と確認画面 -->
  <section v-show="Stepnum == 2">
    <div v-for="(Vegename, index) in VegeList" :key="Vegename + index" class="confirm">
      <h1>{{ vegekeys[VegeList[index]] }}</h1>
      <h1>単価：{{ VegeamoutList[index] }} {{ VegetankaTempList[VegetankaList[index]] }}</h1>
      <h1>価格：{{ VegeMoneyList[index] }}円</h1>
    </div>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button
      v-on:click="
        writeVege(vegekeys, VegeList, VegeMoneyList, VegeamoutList, '三浦涼太郎', VegetankaList)
      "
      class="btn btn-primary"
    >
      送信
    </button>
  </section>
  <div class="card popup" style="width: 30rem" v-show="FinishSend">
    <div class="card-body">
      <h5 class="card-title">送信が完了しました</h5>
      <button v-on:click="refreshPage" class="btn btn-primary">初めに戻る</button>
    </div>
  </div>
</template>
<style>
.title {
  text-align: center;
}
.tanka {
  display: flex;
}
.confirm {
  border: 1px solid gray;
  border-radius: 10px;
  margin: 0 55px;
}
</style>
