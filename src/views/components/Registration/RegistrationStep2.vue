<script setup lang="ts">
import { ref } from 'vue'
import RegStep2image from './RegStep2image.vue';
import {useRoadStationStore}from "@/stores/roadStation"
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [key:string]:{
        [key:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
    }
}
interface Props {
  vegeKeys: string[]
  vegeList: number[]
  uproadData:Vegetables
  uniqueKey:string|null
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
enum Mode{
  Amount="amount",
  Unit="unit",
  Money="Money",
  Photo="Photo",
  RoadStation="RoadStation"
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const roadStationList = ref<string[]>([])
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const vegeMoneyList = ref<number[]>([])
const vegeAmountList = ref<number[]>([])
const vegeUnitList = ref<string[]>([])
const vegeUnitTempList = ref<string[]>(Object.values(vegeUnitTemp))
const uproadData=ref<Vegetables>(props.uproadData)
if (vegeMoneyList.value.length != props.vegeList.length) {
  //これをしないとエラー検知ができなかったはず。初回だけvegeListに合わせて０埋め
  vegeMoneyList.value = new Array(props.vegeList.length).fill(0)
  vegeUnitList.value = new Array(props.vegeList.length).fill("")
  vegeAmountList.value = new Array(props.vegeList.length).fill(0)
  roadStationList.value= new Array(props.vegeList.length).fill("")
}
function updateVegeMoney(value: number, index: number,mode:string) {
  
  if(mode==Mode.Money){
  // マイナスの値になることを防ぐ
    if (value < 0) {
      vegeMoneyList.value[index] = 0
    } else {
      vegeMoneyList.value[index] = value
    }
    updateStep2List(Mode.Money,index)
  }
  if(mode==Mode.Amount){
  // マイナスの値になることを防ぐ
    if (value < 0) {
      vegeAmountList.value[index] = 0
    } else {
      vegeAmountList.value[index] = value
    }
    updateStep2List(Mode.Amount,index)
  }
}
function errorFind() {
  const isMoneyList: boolean =
    vegeMoneyList.value.length != props.vegeList.length ||
    // vegeMoneyList.value.some((item) => item === '') || //inputで値を打った後に消すと空文字ができてしまうからそれを判定するため
    vegeMoneyList.value.some((item) => item === -1)
  const isVegeAmountList: boolean =
    vegeAmountList.value.length != props.vegeList.length ||
    // vegeAmountList.value.some((item) => item === '') ||
    vegeAmountList.value.some((item) => item === 0)
  const isVegeUnitList: boolean = vegeUnitList.value.some((item) => item === "")
  const isroadStationList: boolean = roadStationList.value.some((item) => item === "")

  const isError = isMoneyList || isVegeAmountList || isVegeUnitList||isroadStationList

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
function updateStep2List(action:string,index:number) {
  let unit:string=""
 if(action==Mode.Amount){
  if(vegeAmountList.value[index]!=0&&vegeUnitList.value[index]!=""){
    unit=vegeAmountList.value[index]+vegeUnitList.value[index]
    console.log(unit)
    if(props.uniqueKey)
    uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].unit=unit
  }
 }
 if(action==Mode.Unit){
  if(vegeAmountList.value[index]!=0&&vegeUnitList.value[index]!=""){
    unit=vegeAmountList.value[index]+vegeUnitList.value[index]
    console.log(unit)
    if(props.uniqueKey){
      console.log(props.vegeKeys[props.vegeList[index]])
    uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].unit=unit
  }
    }
    
 }
 if(action==Mode.Money){
  if(props.uniqueKey)
  uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].en=vegeMoneyList.value[index]
 }
 if(action==Mode.RoadStation){
  if(props.uniqueKey)
  uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].roadStation=roadStationList.value[index]
 }
}
function uproadImage(URL:string,index:number){
  if(props.uniqueKey)
  uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].photo=URL
}
</script>
<template>
  <!-- {{ uproadData }} -->
  <section>
    <div v-for="(vegeName, index) in props.vegeList" :key="vegeName + index">
      <h1>{{ vegeKeys[vegeName] }}</h1>
      <h4>どのぐらいの量ですか？</h4>
      <div class="unit">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="vegeAmountList[index]"
          @change="updateVegeMoney(vegeAmountList[index], index,Mode.Amount)"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="vegeUnitList[index]"
          @change="updateStep2List(Mode.Unit,index)"
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
        @input="updateVegeMoney(vegeMoneyList[index], index,Mode.Money)"
      />
      <h4>道の駅を選択してください</h4>
      <select
          class="form-select"
          aria-label="roadStation from"
          v-model="roadStationList[index] "
          @change="updateStep2List(Mode.RoadStation, index)"
        >
          <option selected value="" disabled hidden>道の駅</option>
          <option
            v-for="(roadStationName) in roadStationUnitTempList"
            :key="roadStationName"
            v-bind:value="roadStationName"
          >
            {{ roadStationName }}
          </option>
        </select>
        <RegStep2image
        v-bind:index="index"
        v-bind:vegekeys="vegeKeys"
        v-bind:uniquw-keys="props.uniqueKey"
        v-bind:vege-name="vegeKeys[vegeName]"
        v-on:uproad-image="uproadImage"></RegStep2image>
    </div>
    
    <!-- <h3>vegelist{{ props.vegeList.length }}</h3>
    <h4>money{{ vegeMoneyList.length }}</h4>
    <h1>{{ vegeMoneyList }}</h1>
    <h1>単価：{{ vegeAmountList }}</h1>
    <h1>単位：{{ vegeUnitList }}</h1> -->
    <!-- <h1>道の駅：{{roadStationList }}</h1> -->
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
