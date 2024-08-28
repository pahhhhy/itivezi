<script setup lang="ts">
import { ref } from 'vue'
interface Props {
  vegeKeys: string[]
  vegeList: number[]
  vegeMoneyList: number[]
  vegeAmountList: number[]
  vegeUnitList: string[]
}
interface Emits {
  (event: 'onStep', Next: boolean): void
  (
    event: 'updateStep2List',
    data:{money?:number[];amount?:number[];unit?:string[]}
  ): void
}
enum vegeUnitTemp{
  g="g",
  kg="kg",
  book="本",
  piece="個",
  wheel="輪",
  sheet="枚"
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const vegeMoneyList = ref<number[]>(props.vegeMoneyList)
const vegeAmountList = ref<number[]>(props.vegeAmountList)
const vegeUnitList = ref<string[]>(props.vegeUnitList)
const vegeUnitTempList = ref<string[]>(Object.values(vegeUnitTemp))
if (vegeMoneyList.value.length == 0) {
  //これをしないとエラー検知ができなかったはず。初回だけvegeListに合わせて０埋め
  vegeMoneyList.value = new Array(props.vegeList.length).fill(0)
  vegeUnitList.value = new Array(props.vegeList.length).fill(0)
  vegeAmountList.value = new Array(props.vegeList.length).fill(0)
}
function updateVegeMoney(value: number, index: number) {
  // マイナスの値になることを防ぐ
  if (value < 0) {
    vegeMoneyList.value[index] = 0
  } else {
    vegeMoneyList.value[index] = value
  }
  updateStep2List("Money")
}
function errorFind() {
  const isMoneyList: boolean =
    vegeMoneyList.value.length != props.vegeList.length ||
    // vegeMoneyList.value.some((item) => item === '') || //inputで値を打った後に消すと空文字ができてしまうからそれを判定するため
    vegeMoneyList.value.some((item) => item === 0)
  const isVegeAmountList: boolean =
    vegeAmountList.value.length != props.vegeList.length ||
    // vegeAmountList.value.some((item) => item === '') ||
    vegeAmountList.value.some((item) => item === 0)
  const isVegeUnitList: boolean = vegeAmountList.value.some((item) => item === -1)

  const isError = isMoneyList || isVegeAmountList || isVegeUnitList

  return isError
}
const step2Error = ref<boolean>(false)
function onStep(next: boolean) {
  if (!next) {
    emit('onStep', false)
  } else if (errorFind()) {
    step2Error.value = true
  } else {
    step2Error.value = false
    if (next) {
      emit('onStep', true)
    }
  }
}
function updateStep2List(action:string) {
 if(action=="Amount"){
  emit("updateStep2List",{amount:vegeAmountList.value})
 }
 if(action=="Unit"){
  emit("updateStep2List",{unit:vegeUnitList.value})
 }
 if(action=="Money"){
  emit("updateStep2List",{money:vegeMoneyList.value})
 }
}
</script>
<template>
  <section>
    <h1 v-for="(vegeName, index) in props.vegeList" :key="vegeName + index">
      {{ vegeKeys[vegeName] }}
      <h4>どのぐらいの量ですか？</h4>
      <div class="unit">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="vegeAmountList[index]"
          @change="updateStep2List('Amount')"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="vegeUnitList[index]"
          @change="updateStep2List('Unit')"
        >
          <!-- 選択式ではなく野菜を決めた時点でその野菜に対応した単位を決めてしまった方が良かった -->
          <option selected value="-1" disabled hidden>単位</option>
          <option
            v-for="(vegeName) in vegeUnitTempList"
            :key="vegeName"
            v-bind:value="vegeName"
          >
            {{ vegeName }}
          </option>
        </select>
      </div>
      <h4>何円にしますか？</h4>
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
    <h1>単位：{{ vegeUnitList }}</h1>
    <h1 style="color: red" v-show="errorFind() && step2Error">全ての価格を設定してください</h1>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
</template>
<style>
.unit {
  display: flex;
}
</style>
