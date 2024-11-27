<script setup lang="ts">
import { ref} from 'vue'
import RegStep2image from '../Registration/RegStep2image.vue';
import {useRoadStationStore}from "@/stores/roadStation"
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:vegeElementTables
    }
}
interface vegeElementTables{
  en:number
  farmer:string
  roadStation:string[]
  state:VegeState
  uid:string
  unit:string
  photo:string
}
interface datatable {
  en:number;
  farmer:string
  roadStation:string[]
  state:VegeState
  uid:string
  unit:string
  photo:string
  VegeName:string
}
interface Props {
  vegedata:datatable
  uniqueKey:string|number
}
interface Emits {
  (event: 'onPushChange',uproadData:Vegetables): void
  (event: 'onPushBack'): void
}
interface unitdata{
    number: number, 
    unit: string 
}
enum Mode{
  Amount="amount",
  Unit="unit",
  Money="Money",
  Photo="Photo",
  RoadStation="RoadStation"
}
enum vegeUnitTemp{
  g="g",
  kg="kg",
  book="本",
  piece="個",
  wheel="輪",
  sheet="枚"
}
const vegeUnitTempList = ref<string[]>(Object.values(vegeUnitTemp))
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const vegeunit=ref<unitdata>(splitNumberAndUnit(props.vegedata.unit))
const vegeMoney=ref<number>(props.vegedata.en)
const vegeRoadStation=ref<string[]>(props.vegedata.roadStation)
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const initialVegetables: Vegetables = {
  [props.vegedata.VegeName]: {
    [props.uniqueKey]: {
      en: props.vegedata.en,
      farmer: props.vegedata.farmer,
      roadStation: props.vegedata.roadStation,
      state: props.vegedata.state,
      uid: props.vegedata.uid,
      unit: props.vegedata.unit,
      photo: props.vegedata.photo
    }
  }}
    const uproadData=ref<Vegetables>(initialVegetables)
function splitNumberAndUnit(input: string): unitdata  {
  // 正規表現で数字部分と単位部分をキャプチャする
  const regex = /^(\d+(?:\.\d+)?)(\D+)?$/;
  const match = input.match(regex);
  
  // マッチが見つかった場合、結果を返す
  if (match) {
    const numberPart = parseFloat(match[1]); // 数字部分
    const unitPart = match[2] || ''; // 単位部分 (ない場合は空文字列)
    return { number: numberPart, unit: unitPart };
  }

  // マッチが見つからなかった場合は null を返す
  return { number: 0, unit: "" };
}
function updateVegeMoney(value: number,mode:string) {
  
  if(mode==Mode.Money){
  // マイナスの値になることを防ぐ
    if (value < 0) {
        vegeMoney.value = 0
    } else {
        vegeMoney.value = value
    }
    updateStep2List(Mode.Money)
  }
  if(mode==Mode.Amount){
  // マイナスの値になることを防ぐ
    if (value < 0) {
      vegeunit.value.number = 0
    } else {
        vegeunit.value.number = value
    }
    updateStep2List(Mode.Amount)
  }
}
function updateStep2List(action:string) {
  let unit:string=""
 if(action==Mode.Amount||action==Mode.Unit){
  if(vegeunit.value.number!=0&&vegeunit.value.unit!=""){
    unit=vegeunit.value.number+vegeunit.value.unit
    if(props.uniqueKey)
    uproadData.value[props.vegedata.VegeName][props.uniqueKey].unit=unit
  }
 }
 if(action==Mode.Money){
  if(props.uniqueKey)
  uproadData.value[props.vegedata.VegeName][props.uniqueKey].en=vegeMoney.value
 }
 if(action==Mode.RoadStation){
  if(props.uniqueKey)
  uproadData.value[props.vegedata.VegeName][props.uniqueKey].roadStation=vegeRoadStation.value
 }
}
function uproadImage(URL:string){
  if(props.uniqueKey)
  uproadData.value[props.vegedata.VegeName][props.uniqueKey].photo=URL
}
function onPushChange(){
    emit("onPushChange",uproadData.value)
}
</script>
<template>
  <article  class="myvege_popup">
    <h1>{{props.vegedata.VegeName}}</h1>
    <div class="form">
      <p>単位</p>
      <div class="unit" v-if="vegeunit">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="vegeunit.number"
          @change="updateVegeMoney(vegeunit.number,Mode.Amount)"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="vegeunit.unit"
          @change="updateStep2List(Mode.Unit)"
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
    </div>
    <div class="form">
      <p>値段</p>
      <input
        class="form-control"
        type="number"
        placeholder="何円にしますか？"
        aria-label="default input example"
        v-model="vegeMoney"
        @input="updateVegeMoney(vegeMoney, Mode.Money)"
      />
    </div>
    <div class="form">
      <p>画像</p>
      <RegStep2image
      v-bind:index="0"
      v-bind:vegekeys="props.vegedata.VegeName"
      v-bind:uniquw-keys="props.uniqueKey"
      v-bind:vege-name="props.vegedata.VegeName"
      v-bind:photo="props.vegedata.photo"
      v-on:uproad-image="uproadImage"></RegStep2image>
    </div>
    <div class="form">
      <p>卸先</p>
      <article class="form_check">
        <div  v-for="(element, index) in roadStationUnitTempList" :key="element" class="form_check_element">
          <input
            class="form-check-input"
            type="checkbox"
            :value="element"
            v-model="vegeRoadStation"
            :id="'flexCheckIndeterminate' + index"
            @change="updateStep2List(Mode.RoadStation)"
          />
          <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
            {{ element }}
          </label>
        </div>
      </article>
      
    </div>
   
  <button v-on:click="onPushChange" class="btn btn-success">編集する</button>
  <button v-on:click="emit('onPushBack')" class="btn btn-success">戻る</button>
  </article>
  <div class="blackback"></div>
</template>
<style scoped>
p{
  margin: 0;
}
.myvege_popup{
  position: fixed;
  width: 340px;
  z-index: 10;
  border: 1px solid gray;
  border-radius: 20px;
  top: calc(50% - 150px);
  left: calc(50% - 170px);
  padding: 20px;
  background-color: white;
}
.myvege_popup h1{
  border-bottom: 1px solid var(--text-color);
  font-size: 24px;
  font-weight: bolder;
}
.myvege_popup button{
  margin: 10px 5px;
}
.blackback{
  position: fixed ;
  height: calc(100vh - 60px);
  width: 100vw;
  top: 60px;
  left: 0;
  z-index: 5;
  background-color: rgba(3,3,3,0.5);;
}
.form{
  display: flex;
  margin-top: 10px;
}
.form_check{
  display: flex;
}
.form_check_element{
  width: 60px;
}
.form p{
  width: 50px;
  margin: auto 0;
}
.unit {
  display: flex;
  width: 250px;
}
.form-control{
  width: 250px;
}
.unit>.form-control{
  width: 175px;
}
</style>