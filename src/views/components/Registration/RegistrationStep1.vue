<script setup lang="ts">
import { ref as Vueref} from 'vue'
interface Porps {
  vegeList: number[]
  vegekeys: string[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'changeSelect', element: number[]): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
const SelectvegeList = Vueref<number[]>(porps.vegeList)
const Step1error = Vueref<boolean>(false)

function onStep() {
  if (SelectvegeList.value.length == 0) {
    Step1error.value = true
  } else {
    Step1error.value = false
    emit('OnStep', true)
  }
}
function changeVege() {
  emit('changeSelect', SelectvegeList.value)
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
          v-model="SelectvegeList"
          v-on:change="changeVege"
          :id="'flexCheckIndeterminate' + index"
        />
        <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
          {{ element }}
        </label>
      </div>
    </div>

    <p>Selected Vegetables: {{ SelectvegeList }}</p>
    <h1 style="color: red" v-show="Step1error && SelectvegeList.length == 0">
      野菜を選択してください
    </h1>
    <button v-on:click="onStep()" class="btn btn-primary">次へ</button>
  </section>
</template>
<style></style>
