<script setup lang="ts">
import { ref } from 'vue'
interface Props {
  vegeList: number[]
  vegeKeys: string[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'changeSelect', element: number[]): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const selectVegeList = ref<number[]>(props.vegeList)
const step1Error = ref<boolean>(false)

function onStep(next:boolean) {
  if(!next)emit('OnStep', false)
  else{
    if (selectVegeList.value.length == 0) {
    step1Error.value = true
  } else {
    step1Error.value = false
    emit('OnStep', true)
  }
}
  
}
function changeVege() {
  emit('changeSelect', selectVegeList.value)
}
</script>
<template>
  <section>
    <h1>野菜を選択してください</h1>
    <div class="form">
      <div class="form-check" v-for="(element, index) in props.vegeKeys" :key="element">
        <input
          class="form-check-input"
          type="checkbox"
          :value="index"
          v-model="selectVegeList"
          v-on:change="changeVege"
          :id="'flexCheckIndeterminate' + index"
        />
        <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
          {{ element }}
        </label>
      </div>
    </div>

    <p>Selected Vegetables: {{ selectVegeList }}</p>
    <h1 style="color: red" v-show="step1Error && selectVegeList.length == 0">
      野菜を選択してください
    </h1>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
</template>
<style></style>
