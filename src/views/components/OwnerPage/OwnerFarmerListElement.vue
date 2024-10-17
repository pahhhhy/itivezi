<script setup lang="ts">
import { ref} from 'vue'
interface FarmerListElement{
    [VegeName:string]:{
    unit:string
    en:number
  }
}
interface Props {
  VegeData:FarmerListElement
  FarmerName:string|number
}
const props = defineProps<Props>()
const isActive=ref<boolean>(false)
function pushFarmer() {
    isActive.value = !isActive.value
}
</script>
<template>
    <div class="farmerList-group">
        <button v-on:click="pushFarmer()">
          <h3>{{ props.FarmerName }}さん</h3>
          <h3>{{ Object.keys(props.VegeData).length }}件</h3>
          <i class="bi bi-chevron-down" v-if="!isActive"></i>
          <i class="bi bi-chevron-up" v-if="isActive"></i>
        </button>
        <div class="farmerList-group-element">
          <div v-for="(element,vege) in props.VegeData" :key="vege" v-show="isActive">
            <!-- {{ element }}
            {{vege}} -->
            <article>
              <h3>{{ vege }}</h3>
              <p>{{ element.unit }} {{ element.en }}円</p>
            </article>
          </div>
        </div>
  
      </div>
</template>
<style scoped>
.farmerList-group-element {
    display: flex;
}
.farmerList-group button i {
    display: flex;
    align-items: center;
    margin: auto 0;
  }
  .farmerList-group button {
    display: flex;
    width: 600px;
    margin: 0 20px;
    background-color: white;
    border: none;
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    justify-content: space-between;
  }
</style>