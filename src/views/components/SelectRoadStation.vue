<script setup lang="ts">
import { ref } from 'vue'
import {useRoadStationStore}from "../../stores/roadStation"
interface Emits {
  (event: 'updateRoadStation', RoadStation: string): void
}
const emit = defineEmits<Emits>()
function selectRoadStation(){
    emit('updateRoadStation',roadStation.value)
}
const roadStation = ref<string>("")
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
</script>
<template>
<h1>道の駅を選択してください</h1>
<select
          class="form-select"
          aria-label="roadStation from"
          v-model="roadStation "
          @change="selectRoadStation"
        >
          <option selected value="" disabled hidden>道の駅</option>
          <option
            v-for="(roadStationName) in roadStationUnitTempList"
            :key="roadStationName"
            v-bind:value="roadStationName"
          >
            {{ roadStationName }}
          </option>
        </select>
</template>
<style></style>