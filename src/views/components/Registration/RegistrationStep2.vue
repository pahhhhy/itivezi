<script setup lang="ts">
import { ref as Vueref} from 'vue'
interface Porps {
  vegekeys: string[]
  vegeList: number[]
  VegeMoneyList: number[]
  VegeAmoutList: number[]
  VegeTankaList: number[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (
    event: 'UpdateStep2List',
    vegeMoneyList: number[],
    vegeAmoutList: number[],
    vegeTankaList: number[]
  ): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
const VegemoneyList = Vueref<number[]>(porps.VegeMoneyList)
const VegeamoutList = Vueref<number[]>(porps.VegeAmoutList)
const VegetankaList = Vueref<number[]>(porps.VegeTankaList)
const VegetankaTempList = Vueref<string[]>(['g', 'kg', '本', '個'])
if (VegemoneyList.value.length == 0) {
  //これをしないとエラー検知ができなかったはず。初回だけvegelistに合わせて０埋め
  
  VegemoneyList.value = new Array(porps.vegeList.length).fill(0)
  VegetankaList.value = new Array(porps.vegeList.length).fill(0)
  VegeamoutList.value = new Array(porps.vegeList.length).fill(0)
}
function updateVegeMoney(value: number, index: number) {
  // マイナスの値になることを防ぐ
  if (value < 0) {
    VegemoneyList.value[index] = 0
  } else {
    VegemoneyList.value[index] = value
  }
  UpdateStep2list()
}
function ErrorFind() {
  const IsMoneyList: boolean =
    VegemoneyList.value.length != porps.vegeList.length ||
    // VegemoneyList.value.some((item) => item === '') || //inputで値を打った後に消すと空文字ができてしまうからそれを判定するため
    VegemoneyList.value.some((item) => item === 0)
  const IsVegeamoutList: boolean =
    VegeamoutList.value.length != porps.vegeList.length ||
    // VegeamoutList.value.some((item) => item === '') ||
    VegeamoutList.value.some((item) => item === 0)
  const IsVegetankaList: boolean = VegeamoutList.value.some((item) => item === -1)

  const Iserror = IsMoneyList || IsVegeamoutList || IsVegetankaList
 
  return Iserror
}
const Step2error = Vueref<boolean>(false)
function onStep(Next: boolean) {
  if (!Next) {
    emit('OnStep', false)
  } else if (ErrorFind()) {
    Step2error.value = true
  } else {
    Step2error.value = false
    if (Next) {
      emit('OnStep', true)
    }
  }
}
function UpdateStep2list() {
  emit('UpdateStep2List', VegemoneyList.value, VegeamoutList.value, VegetankaList.value)
}
</script>
<template>
  <section>
    <h1 v-for="(Vegename, index) in porps.vegeList" :key="Vegename + index">
      {{ vegekeys[Vegename] }}
      <div class="tanka">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="VegeamoutList[index]"
          @change="UpdateStep2list"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="VegetankaList[index]"
          @change="UpdateStep2list"
        >
          <!-- 選択式ではなく野菜を決めた時点でその野菜に対応した単位を決めてしまった方が良かった -->
          <option selected value="-1" disabled hidden>単位</option>
          <option
            v-for="(Vegename, index) in VegetankaTempList"
            :key="Vegename"
            v-bind:value="index"
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
        v-model="VegemoneyList[index]"
        @input="updateVegeMoney(VegeMoneyList[index], index)"
      />
    </h1>
    <h3>vegelist{{ porps.vegeList.length }}</h3>
    <h4>money{{ VegeMoneyList.length }}</h4>
    <h1>{{ VegeMoneyList }}</h1>
    <h1>単価：{{ VegeamoutList }}</h1>
    <h1>単位：{{ VegetankaList }}</h1>
    <h1 style="color: red" v-show="ErrorFind() && Step2error">全ての価格を設定してください</h1>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
</template>
<style>
.tanka {
  display: flex;
}
</style>
