<script setup lang="ts">

import { ref } from 'vue'
interface Props {
  vegeKeys: string[]
  selectVege: number[]
  vegeAllData: any
  selectMen: string[]
  selectMenUniqueList: string[]
}
interface Emits {
  (event: 'onStep', next: boolean): void
  (event: 'changeMen', vegeKeyNumber: string[], unique: string[]): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const selectMen = ref<string[]>(new Array(props.selectVege.length).fill(''))
const selectedMenUniqueList = ref<string[]>(new Array(props.selectVege.length).fill(""))
const step2Error = ref<boolean>(false)
//個と親の変数を同じにしたい。でもこっちはSelectVegeの長さによって初期値が違うのでこのやり方で行う
for (let i: number = 0; i < props.selectMen.length; i++) {
  selectMen.value[i] = props.selectMen[i]
  
}
for (let i: number = 0; i < props.selectMenUniqueList.length; i++) {
  selectedMenUniqueList.value[i] = props.selectMenUniqueList[i]
}

function changeMen(keyNumber:number,index: number, unique: string, key: string) {
  selectMen.value[index] = props.vegeAllData[key][unique].farmer
  emit('changeMen', selectMen.value, selectedMenUniqueList.value)
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
    
    <article v-for="(vegeKeyNumber, elementIndex) in props.selectVege" :key="vegeKeyNumber">
      <h1>{{ props.vegeKeys[vegeKeyNumber] }}</h1>
      <select
        class="form-select"
        aria-label="Default select example"
        v-model="selectedMenUniqueList[elementIndex]"
        @change="changeMen(vegeKeyNumber,elementIndex, selectedMenUniqueList[elementIndex], props.vegeKeys[vegeKeyNumber])"
      >
        <option selected value="0" disabled hidden>生産者を選択してください</option>
        <option
          v-for="(vegeElement, index) in props.vegeAllData[props.vegeKeys[vegeKeyNumber]]"
          :key="index"
          :value="index"
        >
          {{ vegeElement.farmer }}
        </option>
      </select>

      <p>SelectMen：{{ selectMen }}</p>
      <p>野菜：{{ props.vegeKeys[vegeKeyNumber] }}</p>
      <p v-if="selectedMenUniqueList[elementIndex] !== ''">
        生産者：{{ props.vegeAllData[props.vegeKeys[vegeKeyNumber]][selectedMenUniqueList[elementIndex] ].farmer }}
      </p>
      <h3 v-if="selectedMenUniqueList[elementIndex] !== ''">
        単位:{{ props.vegeAllData[props.vegeKeys[vegeKeyNumber]][selectedMenUniqueList[elementIndex] ].unit }}
      </h3>
      <h3 v-if="selectedMenUniqueList[elementIndex] !== ''">
        単価:{{ props.vegeAllData[props.vegeKeys[vegeKeyNumber]][selectedMenUniqueList[elementIndex] ].en }}円
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
