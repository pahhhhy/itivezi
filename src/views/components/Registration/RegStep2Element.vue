<script setup lang="ts">
import { ref,watch} from 'vue'
import {useRoadStationStore}from "@/stores/roadStation"
import RegStep2image from './RegStep2image.vue';
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
interface Props {
  vegeName:string
  vegeKeys: string[]
  vegeList: string[]
  uproadData:Vegetables
  uniqueKey:string|null
  index:number
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
interface Emits {
  (event: 'updateUproadData', uproadData: Vegetables,index:number): void
}
defineExpose({
  CheckError
})
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
  const Index =ref<number>(props.index)
const vegename=ref<string>(props.vegeName)
const uniqueKeys=ref<string|null|number>(props.uniqueKey)
const vegeAmount=ref<number>(0)
const vegeUnit = ref<string>("")
const vegeUnitTempList = ref<string[]>(Object.values(vegeUnitTemp))
const vegeMoney=ref<number>(0)
const roadStationList=ref<string[]>([])
const uproadData=ref<Vegetables>(props.uproadData)
  const Checklist = ref(
  Object.values(Mode).reduce((acc, key) => {
    acc[key] = false; // 初期値を false に設定
    return acc;
  }, {} as Record<string, boolean>)
);
function CheckError(){
  let isTure=true
  if(uniqueKeys.value){
    if(uproadData.value[props.vegeList[props.index]][uniqueKeys.value].unit==""){Checklist.value[Mode.Unit]=true;isTure=false}
    if(uproadData.value[props.vegeList[props.index]][uniqueKeys.value].en==-1){Checklist.value[Mode.Money]=true;isTure=false}
    if(uproadData.value[props.vegeList[props.index]][uniqueKeys.value].roadStation.length==0){Checklist.value[Mode.RoadStation]=true;isTure=false}
    }else{console.log("えらー")}
    return isTure
}
function updateVegeMoney(value: number, index: number,mode:string) {
  
  if(mode==Mode.Money){
  // マイナスの値になることを防ぐ
    if (value < 0) {
      vegeMoney.value= 0
    } else {
      vegeMoney.value = value
    }
    updateStep2List(Mode.Money,index)
  }
  if(mode==Mode.Amount){
  // マイナスの値になることを防ぐ
    if (value < 0) {
      vegeAmount.value = 0
    } else {
      vegeAmount.value = value
    }
    updateStep2List(Mode.Amount,index)
  }
}
function updateStep2List(action:string,index:number) {
  let unit:string=""
 if(action==Mode.Amount){
  if(vegeAmount.value!=0&&vegeUnit.value!=""){
    unit=vegeAmount.value+vegeUnit.value
    console.log(unit)
    if(props.uniqueKey)
    uproadData.value[props.vegeList[index]][props.uniqueKey].unit=unit
    if(uniqueKeys.value){
    if(uproadData.value[props.vegeList[props.index]][uniqueKeys.value].unit!=""){Checklist.value[Mode.Unit]=false}}
    emit("updateUproadData",uproadData.value,index)
  }
 }
 if(action==Mode.Unit){
  if(vegeAmount.value!=0&&vegeUnit.value!=""){
    unit=vegeAmount.value+vegeUnit.value
    console.log(unit)
    if(props.uniqueKey){
    uproadData.value[props.vegeList[index]][props.uniqueKey].unit=unit
    if(uniqueKeys.value){
      if(uproadData.value[props.vegeList[props.index]][uniqueKeys.value].unit!=""){Checklist.value[Mode.Unit]=false}}
    emit("updateUproadData",uproadData.value,index)
  }
    }
    
 }
 if(action==Mode.Money){
  if(props.uniqueKey)
  uproadData.value[props.vegeList[index]][props.uniqueKey].en=vegeMoney.value
  if(uniqueKeys.value){
    if(uproadData.value[props.vegeList[props.index]][uniqueKeys.value].en!=0){Checklist.value[Mode.Money]=false}}
  emit("updateUproadData",uproadData.value,index)
 }
 if(action==Mode.RoadStation){
  if(props.uniqueKey)
  uproadData.value[props.vegeList[index]][props.uniqueKey].roadStation=roadStationList.value
  if(uniqueKeys.value){
    if(uproadData.value[props.vegeList[props.index]][uniqueKeys.value].roadStation.length!=0){Checklist.value[Mode.RoadStation]=false}}
  emit("updateUproadData",uproadData.value,index)
 }
}
function uproadImage(URL:string,index:number){
  if(props.uniqueKey)
  uproadData.value[props.vegeList[index]][props.uniqueKey].photo=URL
}
watch(roadStationList, (newValue) => {
  updateStep2List(Mode.RoadStation, props.index);
});

</script>

<template>
  <article  class="myvege_popup">
    <h1>{{ vegename}}</h1>
    <div class="myvege_form">
      <p>単位</p>
      <div class="unit">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="vegeAmount"
          @change="updateVegeMoney(vegeAmount,props.index,Mode.Amount)"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="vegeUnit"
          @change="updateStep2List(Mode.Unit,props.index)"
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
    <p class="errorMes" v-if="Checklist[Mode.Unit]">単位を選択してください</p>
    <div class="myvege_form">
      <p>値段</p>
      <input
        class="form-control"
        type="number"
        placeholder="何円にしますか？"
        aria-label="default input example"
        v-model="vegeMoney"
        @input="updateVegeMoney(vegeMoney,props.index, Mode.Money)"
      />
    </div>
    <p class="errorMes" v-if="Checklist[Mode.Money]">金額を入力してください</p>
    <div class="myvege_form">
      <p>画像</p>
      <RegStep2image
      v-if="uniqueKey"
      v-bind:index="Index"
      v-bind:uniquw-keys="uniqueKey"
      v-bind:vege-name="vegename"
      v-bind:photo=uproadData[vegename][uniqueKey].photo
      v-on:uproad-image="uproadImage"></RegStep2image>
    </div>
    <div class="myvege_form">
      <p>卸先</p>
      <article class="form_check">
        <div  v-for="(element, index) in roadStationUnitTempList" :key="element" class="form_check_element">
          <input
            class="form-check-input"
            type="checkbox"
            :value="element"
            v-model="roadStationList"
            :id="'flexCheckIndeterminate' + index"
            @change="updateStep2List(Mode.RoadStation,props.index)"
          />
          <label class="form-check-label" for="'flexCheckIndeterminate' + index">
            {{ element }}
          </label>
        </div>
      </article>
      </div>
      <p class="errorMes" v-if="Checklist[Mode.RoadStation]">卸先を選択してください</p>
  </article>
</template>
<style scoped>
p{
  margin: 0;
}
.myvege_popup{
  width: 400px;
  z-index: 10;
  border-radius: 20px;
  padding: 20px;
  background-color: white;
  margin:  20px;
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
.myvege_form{
  display: flex;
  margin-top: 10px;
}

.form_check{
  display: flex;
}
.form_check label{
  font-size: 18px;
}
.form_check_element{
  width: 80px;
}
.myvege_form p{
  font-size: 20px;
  width: 80px;
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
@media (max-width: 575.98px) { 
  .myvege_popup{
    width: 340px;
    margin: 20px auto;
  }
  .myvege_form p{
    font-size: 16px;
    width: 50px;
  }
  .form_check label{
    font-size: 16px;
  }
  .form_check_element{
    width: 60px;
  }
}
</style>