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
//dataの数に応じて初期化
const Checklist=ref<boolean[]>([])
  const regStep2Element = ref<InstanceType<typeof RegStep2Element>[]>([]);
for(let i:number=0;i<props.vegeList.length;i++){
  Checklist.value[0]=false
}
function errorFind() {
  let result=true
  for (const element of regStep2Element.value) {
    if (element?.CheckError) { // 安全にメソッドを確認して呼び出し
      const results = element.CheckError();
      if(!results){result=false}
    }
  }
  return !result
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
  <article class="reg2_element">
    <div v-for="(vegeName, index) in props.vegeList" :key="vegeName + index" >
      <RegStep2Element
      v-bind:index="index"
      v-bind:unique-key="props.uniqueKey"
      v-bind:uproad-data="props.uproadData"
      v-bind:vege-keys="props.vegeKeys"
      v-bind:vege-list="props.vegeList"
      ref="regStep2Element"
      v-bind:vege-name="vegeName"></RegStep2Element>
    </div>
  </article>
    
    <div class="greenbutton_group">
      <button v-on:click="onStep(false)" class="greenbutton">戻る</button>
      <button v-on:click="onStep(true)" class="greenbutton">次へ</button>
    </div>
    
</template>
<style>
.reg2_element{
  height: 100%;
  width: 900px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
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
.greenbutton_group{
  width: 400px;
  margin: auto;
}
@media (max-width: 575.98px) { 
  .greenbutton_group{
    width: auto;
  }
  .reg2_element{
    width: 340px;
  }
}
</style>
