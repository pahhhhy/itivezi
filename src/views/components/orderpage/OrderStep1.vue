<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  vegeKeys: string[]
  selectVegeList: number[]
}
interface Emits {
  (event: 'onStep', Next: boolean): void
  (event: 'changeVege', element: number[]): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const step1Error = ref<boolean>(false)
const selectedVege = ref<number[]>(props.selectVegeList)
function onStep(next: boolean) {
  if(!next)emit('onStep', false)
  if (selectedVege.value.length == 0) {
    step1Error.value = true
  } else {
    step1Error.value = false
    if (next) {
      emit('onStep', true)
    }
  }
}
function changeVege() {
  emit('changeVege', selectedVege.value)
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
          v-model="selectedVege"
          v-on:change="changeVege"
          :id="'flexCheckIndeterminate' + index"
        />
        <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
          {{ element }}
        </label>
      </div>
    </div>

    <p>Selected Vegetables: {{ selectVegeList }}</p>
    <h1 style="color: red" v-show="step1Error && selectedVege.length == 0">
      野菜を選択してください
    </h1>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
</template>
<style>
.title {
  text-align: center;
}
.form {
  width: 300px; /* コンテナの幅を設定 */
  height: 200px; /* コンテナの高さを設定 */
  border: 1px solid #ccc;
  overflow: auto; /* スクロール可能にする */
}
</style>
