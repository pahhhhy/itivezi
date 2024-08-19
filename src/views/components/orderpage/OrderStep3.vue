<script setup lang="ts">
import { ref, watch } from 'vue'
interface Props {
  vegeKeys: string[]
  vegeAllData: any
  selectVege: number[]
  selectMenUniqueList: string[]
  selectDate: Date | null
  vegeCount: number[]
  totalMoney: number[]
}
interface Emits {
  (event: 'onStep', Next: boolean): void
  (event: 'changeCount', count: number[], money: number): void
  (event: 'changeDate', date: Date | null): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const vegeCountList = ref<number[]>(new Array(props.selectVege.length).fill(0))
const totalMoney = ref<number[]>(props.totalMoney)
const selectDate = ref<Date | null>(props.selectDate)
const allTotalMoney = ref<number>(0)
//個と親の変数を同じにしたい。でもこっちはSelectVegeの長さによって初期値が違うのでこのやり方で行う
for (let i: number = 0; i < props.vegeCount.length; i++) {
  vegeCountList.value[i] = props.vegeCount[i]
}
function changeMoney(money: number, index: number) {
  totalMoney.value[index] = vegeCountList.value[index] * money

  for (let i: number = 0; i < totalMoney.value.length; i++) {
    allTotalMoney.value += totalMoney.value[i]
  }
  emit('changeCount', vegeCountList.value, allTotalMoney.value)
}
function changeDate() {
  emit('changeDate', selectDate.value)
}

const step3Error = ref<boolean>(false)
function onStep(next: boolean) {
  if (!next) {
    emit('onStep', false)
  } else {
    if (vegeCountList.value.some((item) => item === 0)) {
      step3Error.value = true
    } else {
      step3Error.value = false
      emit('onStep', true)
    }
  }
}
watch(selectDate, (): void => {
  changeDate()
})
</script>

<template>
  <section>
    <h1>Step3</h1>
    <h1>{{ vegeCountList }}</h1>
    <h1>{{ selectDate }}</h1>
    <div class="form_Step3" v-for="(element, index) in props.selectVege" v-bind:key="index">
      <!-- スクロールで値が変わるのと０以下を書くことができるのがまずい -->
      <h1>
        {{ props.vegeKeys[props.selectVege[index]] }} :{{
          props.vegeAllData[props.vegeKeys[props.selectVege[index]]][props.selectMenUniqueList[index]].unit
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
            props.vegeAllData[props.vegeKeys[props.selectVege[index]]][props.selectMenUniqueList[index]]
              .en,
            index
          )
        "
      />

      <h2>何組：{{ vegeCountList[index] }}組</h2>
      <h2>合計：{{ totalMoney[index] }}円</h2>
      <h2 style="color: red" v-show="step3Error && vegeCountList[index] == 0">
        個数を指定してください
      </h2>
      <!-- 今日より前を選択不可にしないと -->
    </div>
    <h1 style="padding-top: 30px">日付を指定してください</h1>
    <VueDatePicker
      v-model="selectDate"
      format="yyyy/MM/dd"
      locale="ja"
      model-type="yyyy-MM-dd"
      week-start="0"
      :enable-time-picker="false"
      auto-apply
      no-today
    />
    <h1>日付指定：{{ selectDate }}</h1>
    <h1>総合計金額：{{ allTotalMoney }}</h1>
    <h1 style="color: red" v-show="step3Error && selectDate == null">日付を選択してください</h1>
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
