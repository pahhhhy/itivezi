<script setup lang="ts">
import { ref } from 'vue'
enum roadStationUnitTemp{
  Murone="室根",
  Kawasaki="川崎",
}
interface Props {
  RoadStation: string
}
interface Emits {
  (event: 'onStep', Next: boolean): void
  (event: 'updateRoadStation', RoadStation: string): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
function selectRoadStation(){
    emit('updateRoadStation',roadStation.value)
}
function onStep(next: boolean) {
  if (!next) {
    emit('onStep', false)
  } else if (roadStation.value=='') {
    error.value = true
  } else {
    error.value = false
    if (next) {
      emit('onStep', true)
    }
  }
}
const error=ref<boolean>(false)
const roadStation = ref<string>(props.RoadStation)
const roadStationUnitTempList = ref<string[]>(Object.values(roadStationUnitTemp))
</script>
<template>
<h1>道の駅を選択してください</h1>
<select
          class="form-select"
          aria-label="roadStation from"
          v-model="roadStation "
          @change="selectRoadStation"
        >
          <!-- 選択式ではなく野菜を決めた時点でその野菜に対応した単位を決めてしまった方が良かった -->
          <option selected value="" disabled hidden>道の駅</option>
          <option
            v-for="(roadStationName) in roadStationUnitTempList"
            :key="roadStationName"
            v-bind:value="roadStationName"
          >
            {{ roadStationName }}
          </option>
        </select>
        <h1 style="color: red" v-show="roadStation==''&& error">道の駅を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
</template>
<style></style>