<script setup lang="ts">
import { ref,watch} from 'vue'
interface Props {
  titleData: titleDataTables
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
interface titleDataTables{
  orderTime: string, 
  orderName: string, 
  state: string
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const isActive=ref<boolean>(false)
function selectOrderData(){
    isActive.value=!isActive.value
}
</script>
<template>
    <div class="order-table-unit" v-on:click="selectOrderData()">

        <p>{{ props.titleData["orderTime"] }}</p>
        <p>{{ props.titleData["orderName"] }}</p>
        <p>{{ props.titleData["state"] }}</p>
        <i class="bi bi-chevron-down" v-if="!isActive"></i>
        <i class="bi bi-chevron-up" v-if="isActive"></i>
      </div>

      <div class="order-table-selected" v-if="isActive">
        <div v-for="(vegeData,number) in selectedTableUnitList[time]" v-bind:key="number"
             class="order-table-selected-unit">
          <h3>{{ vegeData["vegeName"] }}</h3>
          <p>単位：{{ vegeData["unit"] }}</p>
          <p>個数：{{ vegeData["amount"] }}組</p>
          <p>農家名：{{ vegeData["farmerName"] }}</p>
          <p>料金：{{ vegeData["price"] }}円</p>
        </div>
      </div>
</template>
<style scoped>

</style>