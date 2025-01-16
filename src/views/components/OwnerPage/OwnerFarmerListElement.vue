<script setup lang="ts">
import router from '@/router'
// クエリdataを持ったページに異動する
const navigateToDetail = (name: string |number,roadStation:string) => {
  router.push({ name: 'Owner-order',  query: {
      name,
      roadStation
    } })
}
interface FarmerListElement{
    [VegeName:string]:{
    unit:string
    en:number
  }
}
interface Props {
  VegeData:FarmerListElement
  FarmerName:string|number
  roadStation:string
}
const props = defineProps<Props>()
</script>
<template>
    <div class="farmerList-group" @click="navigateToDetail(props.FarmerName,props.roadStation)">
        <h4>{{props.FarmerName}}</h4>
        <p>件数：{{ Object.keys(props.VegeData).length }}件</p>
      <button><i class="bi bi-chevron-right"></i></button>
      </div>
</template>
<style scoped>

.farmerList-group{
  display: flex;
  background-color: white;
      height: 30px;
      border-top: 1px solid var(--line-color);
      border-bottom: 1px solid var(--line-color);
      width: 100%;
}
.farmerList-group h4{
  width: 200px;
  margin: 0;
}
.farmerList-group p{
  margin: 0;
}
.farmerList-group button i {
    display: flex;
    align-items: center;
    margin: auto 0;
  }
  .farmerList-group button {
    display: flex;
    width: 20px;
    background-color: white;
    margin: auto;
    height: 30px;
    color: black;
    border: none;
    border-top: 1px solid var(--line-color);
    border-bottom: 1px solid var(--line-color);
    justify-content: space-between;
  }
</style>