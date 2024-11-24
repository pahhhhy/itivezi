<script setup lang="ts">
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Props {
  VegeData:datatable
  unique:string|number
}
interface Emits {
  (event: 'deleteVegeData', unique: string|number,vegeName:string,): void
  (event: 'changeVegeData', unique: string|number,vegedata:datatable,): void
}
interface datatable {
  en:number;
  farmer:string
  roadStation:string[]
  state:VegeState
  uid:string
  unit:string
  photo:string
  VegeName:string
}

const emit = defineEmits<Emits>()
const props = defineProps<Props>()
function deleteVegeData(){
  emit("deleteVegeData",props.unique,props.VegeData.VegeName)
}
function changeVegeData(){
  emit("changeVegeData",props.unique,props.VegeData)
}
</script>
<template>
  <div class="card_element">
    <div class="img_name_money">
      <img :src="props.VegeData.photo" class="card-img-top" alt="..." v-if="props.VegeData.photo!='none'">
      <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="props.VegeData.photo=='none'">
      <div class="name_money">
        <h5>{{props.VegeData.VegeName}}</h5>

        <div class="money_unit">
          <p>{{props.VegeData.unit}}</p>
          <p>￥{{props.VegeData.en}}</p>
        </div>
      </div>
      <div class="icons">
        <button v-on:click="changeVegeData">
          <i class="bi bi-pencil-square"></i>
        </button>

        <button v-on:click="deleteVegeData">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    </div>
    <p v-for="(Wholesaler,index) in props.VegeData.roadStation" v-bind:key="index" class="Wholesaler">
      【{{ Wholesaler }}】
    </p>
  </div>
</template>
<style scoped>
p{
  margin: 0;
}
h5{
  margin: 0;
}
button{
  border: none;
  background-color: white;
  
}
.card-img-top{
  height: 150px;
}
.card_element{
  border-top: var(--line-color) 1px solid;
  border-bottom: var(--line-color) 1px solid;
}
.card_name_money{
  border-bottom: 1px solid var(--line-color);
  width: 270px;
  height: 70px;
}
.Wholesaler{
  font-size: 14px!important;
  text-align: left;
  border-radius: 10px;
  display: inline-block;
  padding: 3px;
  text-align: center;
  border: 2px solid var(--main-color);
}
.img_name_money{
  display: flex;
  height: 45px;
}
.img_name_money img{
  height: 40px; 
  width: 70px;
  object-fit: contain;
}
.name_money{
  width: 150px;
  height: 100%;
}
.name_money h5{
  padding-left: 5px;
  font-size: 16px;
}
.money_unit{
  display: flex;
  justify-content: space-between;
  color: var(--other-color);
  width: 100%;
  font-size: 18px;
  }
.icons{
  width: 50px;
  height: 80px;
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}
.icons button{
  width: 25px;
  height: 32px;
}
.icons i{
  color: var(--other-color);
  font-size: 25px;
}
</style>