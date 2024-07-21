<script setup lang="ts">
import { ref, watch } from 'vue'
interface Porps {
  vegekeys: string[]
  vegealldata: { [key: string]: any[] }
  Selectvege: number[]
  SelectMennum: number[]
  SelectDate: Date | null
  vegeCount: number[]
  Totalmoney: number[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'changecount', count: number[], money: number): void
  (event: 'changedate', date: Date | null): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
const vegeCountList = ref<number[]>(new Array(porps.Selectvege.length).fill(0))
const totalmoney = ref<number[]>(porps.Totalmoney)
const Selectdate = ref<Date | null>(porps.SelectDate)
const alltotalmony = ref<number>(0)
//個と親の変数を同じにしたい。でもこっちはSelectVegeの長さによって初期値が違うのでこのやり方で行う
for (let i: number = 0; i < porps.vegeCount.length; i++) {
  vegeCountList.value[i] = porps.vegeCount[i]
}
function changeMoney(money: number, index: number) {
  totalmoney.value[index] = vegeCountList.value[index] * money

  for (let i: number = 0; i < totalmoney.value.length; i++) {
    alltotalmony.value += totalmoney.value[i]
  }
  emit('changecount', vegeCountList.value, alltotalmony.value)
}
function chagedate() {
  emit('changedate', Selectdate.value)
}

const Step3error = ref<boolean>(false)
function onStep(Next: boolean) {
  if (!Next) {
    emit('OnStep', false)
  } else {
    if (vegeCountList.value.some((item) => item === 0)) {
      Step3error.value = true
    } else {
      Step3error.value = false
      emit('OnStep', true)
    }
  }
}
watch(Selectdate, (): void => {
  chagedate()
})
</script>

<template>
  <section>
    <h1>Step3</h1>
    <h1>{{ vegeCountList }}</h1>
    <h1>{{ SelectDate }}</h1>
    <div class="form_Step3" v-for="(element, index) in porps.Selectvege" v-bind:key="index">
      <!-- スクロールで値が変わるのと０以下を書くことができるのがまずい -->
      <h1>
        {{ porps.vegekeys[porps.Selectvege[index]] }} :{{
          porps.vegealldata[porps.vegekeys[porps.Selectvege[index]]][porps.SelectMennum[index]].unit
        }}
      </h1>
      <input
        class="form-control"
        type="number"
        placeholder="何組買いますか？"
        aria-label="default input example"
        v-model="vegeCountList[index]"
        @change="
          changeMoney(
            porps.vegealldata[porps.vegekeys[porps.Selectvege[index]]][porps.SelectMennum[index]]
              .en,
            index
          )
        "
      />

      <h2>何組：{{ vegeCountList[index] }}組</h2>
      <h2>合計：{{ Totalmoney[index] }}円</h2>
      <h2 style="color: red" v-show="Step3error && vegeCountList[index] == 0">
        個数を指定してください
      </h2>
      <!-- 今日より前を選択不可にしないと -->
    </div>
    <h1 style="padding-top: 30px">日付を指定してください</h1>
    <VueDatePicker
      v-model="Selectdate"
      format="yyyy/MM/dd"
      locale="ja"
      model-type="yyyy-MM-dd"
      week-start="0"
      :enable-time-picker="false"
      auto-apply
      no-today
    />
    <h1>日付指定：{{ Selectdate }}</h1>
    <h1>総合計金額：{{ alltotalmony }}</h1>
    <h1 style="color: red" v-show="Step3error && Selectdate == null">日付を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
</template>
<style>
.form_Step3 {
  border: 1px solid gray;
  padding: 20px;
}
</style>
