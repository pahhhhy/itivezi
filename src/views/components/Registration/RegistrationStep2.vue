<script setup lang="ts">
import { ref } from 'vue'
import RegStep2Element from './RegStep2Element.vue';
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
  vegeKeys: string[]
  vegeList: string[]
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
const emit = defineEmits<Emits>()
const props = defineProps<Props>()

const uproadData=ref<Vegetables>(props.uproadData)
function errorFind() {
  let error=false
  Object.keys(uproadData.value).forEach((vegeName) => {
    Object.keys(uproadData.value[vegeName]).forEach((unique) => {
      const Data=uproadData.value[vegeName][unique]
      if(Data.en==-1)error=true
      if(Data.roadStation.length==0)error=true
      if(Data.unit=="")error=true
    })
  })
  return error
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
</script>
<template>
    <div v-for="(vegeName, index) in props.vegeList" :key="vegeName + index" class="reg2_element">
      <RegStep2Element
      v-bind:index="index"
      v-bind:unique-key="props.uniqueKey"
      v-bind:uproad-data="props.uproadData"
      v-bind:vege-keys="props.vegeKeys"
      v-bind:vege-list="props.vegeList"
      v-bind:vege-name="vegeName"></RegStep2Element>
    </div>
    <h2 class="errortext" style="color: red" v-show="errorFind() && step2Error">全ての価格を設定してください</h2>
    <button v-on:click="onStep(false)" class="greenbutton">戻る</button>
    <button v-on:click="onStep(true)" class="greenbutton">次へ</button>
</template>
<style>
.reg2_element{
  height: 100%;
}

.errortext{
  margin: 0 30px;
}
.greenbutton {
  background-color: var(--main-color);
  color: white;
  padding: 10px 50px;
  border-radius: 50px;
  font-size: 20px;
  margin: 20px 20px;
  font-weight: bolder;
  border: none;
  margin-top: 30px;
}
</style>
