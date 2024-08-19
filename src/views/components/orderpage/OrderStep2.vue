<script setup lang="ts">
import { ref } from 'vue'
interface Props {
  vegeKeys: string[]
  selectVege: number[]
  vegeAllData: { [key: string]: any[] }
  selectMen: string[]
  selectMenNum: number[]
}
interface Emits {
  (event: 'onStep', next: boolean): void
  (event: 'changeMen', element: string[], number: number[]): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const selectMen = ref<string[]>(new Array(props.selectVege.length).fill(''))
const step2Num = ref<number[]>(new Array(props.selectVege.length).fill(-1))
const step2Error = ref<boolean>(false)
//個と親の変数を同じにしたい。でもこっちはSelectVegeの長さによって初期値が違うのでこのやり方で行う
for (let i: number = 0; i < props.selectMen.length; i++) {
  selectMen.value[i] = props.selectMen[i]
  step2Num.value[i] = props.selectMenNum[i]
}

function changeMen(index: number, sMen: number, key: string) {
  selectMen.value[index] = props.vegeAllData[key][sMen].s
  emit('changeMen', selectMen.value, step2Num.value)
}
function onStep(next: boolean) {
  if (!next) {
    emit('onStep', false)
  } else {
    if (selectMen.value.some((item) => item === '')) {
      step2Error.value = true
    } else {
      step2Error.value = false
      emit('onStep', true)
    }
  }
}
</script>

<template>
  <section>
    <h1>Step2</h1>
    <article v-for="(element, index) in props.selectVege" v-bind:key="element">
      <!-- 戻ってきたときにformに選択されていないバグがあるが治し方がわからん -->
      <h1>{{ props.vegeKeys[element] }}</h1>
      <select
        class="form-select"
        aria-label="Default select example"
        v-model="step2Num[index]"
        @change="changeMen(index, step2Num[index], props.vegeKeys[element])"
      >
        <option selected value="0" disabled hidden>生産者の選択してください</option>
        <option
          v-for="(vegeElement, index) in props.vegeAllData[props.vegeKeys[element]]"
          v-bind:key="index"
          v-bind:value="index"
        >
          {{ props.vegeAllData[props.vegeKeys[element]][index].s }}
        </option>
      </select>
      <p></p>
      <p>SelectMen：{{ selectMen }}</p>
      <p>野菜：{{ props.vegeKeys[element] }}</p>
      <p v-if="step2Num[index] != -1">
        生産者：{{ props.vegeAllData[props.vegeKeys[element]][step2Num[index]].s }}
      </p>
      <h3 v-if="step2Num[index] != -1">
        単位:{{ props.vegeAllData[props.vegeKeys[element]][step2Num[index]].unit }}
      </h3>
      <h3 v-if="step2Num[index] != -1">
        単価:{{ props.vegeAllData[props.vegeKeys[element]][step2Num[index]].en }}円
      </h3>
    </article>

    <h1 style="color: red" v-show="step2Error && selectMen.some((item) => item === '')">
      生産者を選択してください
    </h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
</template>
<style></style>
