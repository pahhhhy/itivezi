<script setup lang="ts">
import { ref } from 'vue'
interface Porps {
  vegekeys: string[]
  Selectvege: number[]
  vegealldata: { [key: string]: any[] }
  Selectmen: string[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'changemen', element: string[]): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
const selectmen = ref<string[]>(new Array(porps.Selectvege.length).fill(''))
//個と親の変数を同じにしたい。でもこっちはSelectVegeの長さによって初期値が違うのでこのやり方で行う
for (let i: number = 0; i < porps.Selectmen.length; i++) {
  selectmen.value[i] = porps.Selectmen[i]
}

const Step2Num = ref<number[]>(new Array(porps.Selectvege.length).fill(-1))
const Step2error = ref<boolean>(false)
function changemen(index: number, SMEN: number, key: string) {
  selectmen.value[index] = porps.vegealldata[key][SMEN].s
  emit('changemen', selectmen.value)
}
function onStep(Next: boolean) {
  if (!Next) {
    emit('OnStep', false)
  } else {
    if (selectmen.value.some((item) => item === '')) {
      Step2error.value = true
    } else {
      Step2error.value = false
      emit('OnStep', true)
    }
  }
}
</script>

<template>
  <section>
    <h1>Step2</h1>
    <article v-for="(element, index) in porps.Selectvege" v-bind:key="element">
      <!-- 戻ってきたときにformに選択されていないバグがあるが治し方がわからん -->
      <h1>{{ porps.vegekeys[element] }}</h1>
      <select
        class="form-select"
        aria-label="Default select example"
        v-model="Step2Num[index]"
        @change="changemen(index, Step2Num[index], porps.vegekeys[element])"
      >
        <option selected value="0" disabled hidden>生産者の選択してください</option>
        <option
          v-for="(Vegeelement, index) in porps.vegealldata[porps.vegekeys[element]]"
          v-bind:key="index"
          v-bind:value="index"
        >
          {{ porps.vegealldata[porps.vegekeys[element]][index].s }}
        </option>
      </select>
      <p></p>
      <p>SelectMen：{{ selectmen }}</p>
      <p>野菜：{{ porps.vegekeys[element] }}</p>
      <p v-if="Step2Num[index] != -1">
        生産者：{{ porps.vegealldata[porps.vegekeys[element]][Step2Num[index]].s }}
      </p>
      <h3 v-if="Step2Num[index] != -1">
        単位:{{ porps.vegealldata[porps.vegekeys[element]][Step2Num[index]].unit }}
      </h3>
      <h3 v-if="Step2Num[index] != -1">
        単価:{{ porps.vegealldata[porps.vegekeys[element]][Step2Num[index]].en }}円
      </h3>
    </article>

    <h1 style="color: red" v-show="Step2error && selectmen.some((item) => item === '')">
      生産者を選択してください
    </h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
</template>
<style></style>
