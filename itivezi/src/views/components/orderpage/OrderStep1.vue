<script setup lang="ts">
import { ref } from 'vue'

interface Porps {
  vegekeys: string[]
  SelectVegelist: number[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'changeVege', element: number[]): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
const Step1error = ref<boolean>(false)
const selectedVege = ref<number[]>(porps.SelectVegelist)
function onStep(Next: boolean) {
  if (selectedVege.value.length == 0) {
    Step1error.value = true
  } else {
    Step1error.value = false
    if (Next) {
      emit('OnStep', true)
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
      <div class="form-check" v-for="(element, index) in porps.vegekeys" :key="element">
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

    <p>Selected Vegetables: {{ SelectVegelist }}</p>
    <h1 style="color: red" v-show="Step1error && selectedVege.length == 0">
      野菜を選択してください
    </h1>
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
