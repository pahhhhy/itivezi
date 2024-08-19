<script setup lang="ts">
import { ref as vueRef } from 'vue'
interface Props {
  vegeKeys: string[]
  vegeList: number[]
  vegeMoneyList: number[]
  vegeAmountList: number[]
  vegeTankaList: number[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (
    event: 'UpdateStep2List',
    vegeMoneyList: number[],
    vegeAmountList: number[],
    vegeTankaList: number[]
  ): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const vegeMoneyList = vueRef<number[]>(props.vegeMoneyList)
const vegeAmountList = vueRef<number[]>(props.vegeAmountList)
const vegeTankaList = vueRef<number[]>(props.vegeTankaList)
const vegeTankaTempList = vueRef<string[]>(['g', 'kg', '本', '個'])
if (vegeMoneyList.value.length == 0) {
  //これをしないとエラー検知ができなかったはず。初回だけvegelistに合わせて０埋め
  vegeMoneyList.value = new Array(props.vegeList.length).fill(0)
  vegeTankaList.value = new Array(props.vegeList.length).fill(0)
  vegeAmountList.value = new Array(props.vegeList.length).fill(0)
}
function updateVegeMoney(value: number, index: number) {
  // マイナスの値になることを防ぐ
  if (value < 0) {
    vegeMoneyList.value[index] = 0
  } else {
    vegeMoneyList.value[index] = value
  }
  updateStep2List()
}
function errorFind() {
  const isMoneyList: boolean =
    vegeMoneyList.value.length != props.vegeList.length ||
    // VegemoneyList.value.some((item) => item === '') || //inputで値を打った後に消すと空文字ができてしまうからそれを判定するため
    vegeMoneyList.value.some((item) => item === 0)
  const isVegeAmountList: boolean =
    vegeAmountList.value.length != props.vegeList.length ||
    // VegeamoutList.value.some((item) => item === '') ||
    vegeAmountList.value.some((item) => item === 0)
  const isVegeTankaList: boolean = vegeAmountList.value.some((item) => item === -1)

  const isError = isMoneyList || isVegeAmountList || isVegeTankaList

  return isError
}
const step2Error = vueRef<boolean>(false)
function onStep(next: boolean) {
  if (!next) {
    emit('OnStep', false)
  } else if (errorFind()) {
    step2Error.value = true
  } else {
    step2Error.value = false
    if (next) {
      emit('OnStep', true)
    }
  }
}
function updateStep2List() {
  emit('UpdateStep2List', vegeMoneyList.value, vegeAmountList.value, vegeTankaList.value)
}
</script>
<template>
  <section>
    <h1 v-for="(vegeName, index) in props.vegeList" :key="vegeName + index">
      {{ vegeKeys[vegeName] }}
      <div class="tanka">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="vegeAmountList[index]"
          @change="updateStep2List"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="vegeTankaList[index]"
          @change="updateStep2List"
        >
          <!-- 選択式ではなく野菜を決めた時点でその野菜に対応した単位を決めてしまった方が良かった -->
          <option selected value="-1" disabled hidden>単位</option>
          <option
            v-for="(vegename, index) in vegeTankaTempList"
            :key="vegename"
            v-bind:value="index"
          >
            {{ vegeTankaTempList[index] }}
          </option>
        </select>
      </div>

      <input
        class="form-control"
        type="number"
        placeholder="何円にしますか？"
        aria-label="default input example"
        v-model="vegeMoneyList[index]"
        @input="updateVegeMoney(vegeMoneyList[index], index)"
      />
    </h1>
    <h3>vegelist{{ props.vegeList.length }}</h3>
    <h4>money{{ vegeMoneyList.length }}</h4>
    <h1>{{ vegeMoneyList }}</h1>
    <h1>単価：{{ vegeAmountList }}</h1>
    <h1>単位：{{ vegeTankaList }}</h1>
    <h1 style="color: red" v-show="errorFind() && step2Error">全ての価格を設定してください</h1>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
</template>
<style>
.tanka {
  display: flex;
}
</style>
