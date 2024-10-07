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
  vegeName:number
  vegeKeys: string[]
  vegeList: number[]
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
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const vegeAmount=ref<number>(0)
const vegeUnit = ref<string>("")
const vegeUnitTempList = ref<string[]>(Object.values(vegeUnitTemp))
const vegeMoney=ref<number>(0)
const roadStationList=ref<string[]>([])
const uproadData=ref<Vegetables>(props.uproadData)
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
    uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].unit=unit
    emit("updateUproadData",uproadData.value,index)
  }
 }
 if(action==Mode.Unit){
  if(vegeAmount.value!=0&&vegeUnit.value!=""){
    unit=vegeAmount.value+vegeUnit.value
    console.log(unit)
    if(props.uniqueKey){
      console.log(props.vegeKeys[props.vegeList[index]])
    uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].unit=unit
    emit("updateUproadData",uproadData.value,index)
  }
    }
    
 }
 if(action==Mode.Money){
  if(props.uniqueKey)
  uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].en=vegeMoney.value
  emit("updateUproadData",uproadData.value,index)
 }
 if(action==Mode.RoadStation){
  if(props.uniqueKey)
  uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].roadStation=roadStationList.value
  emit("updateUproadData",uproadData.value,index)
 }
}
function uproadImage(URL:string,index:number){
  if(props.uniqueKey)
  uproadData.value[props.vegeKeys[props.vegeList[index]]][props.uniqueKey].photo=URL
}
watch(roadStationList, (newValue) => {
  updateStep2List(Mode.RoadStation, props.index);
});
</script>

<template>
<h1>{{ vegeKeys[vegeName] }}</h1>
      <h4>どのぐらいの量ですか？</h4>
      <div class="unit">
        <input
          class="form-control"
          type="number"
          placeholder="単価"
          aria-label="default input example"
          v-model="vegeAmount"
          @change="updateVegeMoney(vegeAmount, index,Mode.Amount)"
        />
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="vegeUnit"
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
        v-model="vegeMoney"
        @input="updateVegeMoney(vegeMoney, index,Mode.Money)"
      />
      <h4>道の駅を選択してください</h4>
      <div class="form-check" v-for="(element, index) in roadStationUnitTempList" :key="element">
        <input
          class="form-check-input"
          type="checkbox"
          :value="element"
          v-model="roadStationList"
          :id="'flexCheckIndeterminate' + index"
        />
        <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
          {{ element }}
        </label>
      </div>
        <RegStep2image
        v-bind:index="index"
        v-bind:vegekeys="vegeKeys"
        v-bind:uniquw-keys="props.uniqueKey"
        v-bind:vege-name="vegeKeys[vegeName]"
        v-on:uproad-image="uproadImage"></RegStep2image>
</template>
<style scoped>

</style>