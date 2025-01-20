<script setup lang="ts">
import { ref } from 'vue'
import { type User } from 'firebase/auth'
import { useVegeStore } from '@/stores/vege'
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string[]
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
    }
}
interface Props {
  vegeKeys: string[]
  vegeList: string[]
  uproadData:Vegetables
  currentUser: User | null
  uniqueKey:string|null
}
interface Emits {
  (event: 'onStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
  const vegeStore=useVegeStore()
const props = defineProps<Props>()
async function vegeWriteHandler() { 
  finishSend.value=await  vegeStore.updateVegeData(props.uproadData)
}
function onStep(next: boolean) {
  if (!next) emit('onStep', false)
}
const finishSend = ref<boolean>(false)

const refreshPage = () => {
  location.reload() // 現在のページをリロード
}
</script>
<template>
  <!-- <p>{{ props.vegeAmountList }}</p>
  <p>{{ props.vegeList }}</p>
  <p>{{ props.vegeUnitList }}</p> -->

  <section v-if="props.uniqueKey!=null" class="chack_data">
    <div v-for="(element, vegeName) in props.uproadData" :key="vegeName" class="confirm" >
      <article  class="myvege_popup">
        <h1>{{ vegeName}}</h1>
        <div class="myvege_form">
          <p>単位</p>
          <p>{{element[props.uniqueKey].unit }}</p>
          
        </div>
        <div class="myvege_form">
          <p>値段</p>
          <p>￥{{ element[props.uniqueKey].en }}</p>
        </div>
        <div class="myvege_form">
          <p>画像</p>
          <img :src="element[props.uniqueKey].photo" alt="" v-if="element[props.uniqueKey].photo!='none'">
      <img v-if="element[props.uniqueKey].photo=='none'" src="../../../assets/Noimage.jpeg"> 
        </div>
        <div class="myvege_form">
          <p>卸先</p>
          <p v-for="(roadStation) in element[props.uniqueKey].roadStation" :key="roadStation">
            {{ roadStation }}
          </p>
          </div>
      </article>
    </div>
    
  </section>
  <div class="reg3_button">
    <button v-on:click="onStep(false)" >戻る</button>
    <button v-on:click="vegeWriteHandler" >送信</button>
  </div>
  
  <div class="card_popup"  v-show="finishSend">
    <div class="card-body">
      <h5 class="card-title">送信が完了しました</h5>
      <button v-on:click="refreshPage" class="btn btn-primary">初めに戻る</button>
    </div>
    
  </div>
  <div class="blackback" v-if="finishSend"></div>
</template>
<style>
p{
  margin: 0;
}
.card_popup{
  position: fixed;
  width: 340px;
  z-index: 10;
  border: 1px solid gray;
  border-radius: 20px;
  top: calc(50% - 150px);
  left: calc(50% - 170px);
  padding: 20px;
  background-color: white;
}
.card_popup h5{
  text-align: center;
}
.card_popup button{
  background-color: var(--main-color);
  color: white;
  padding: 10px 50px;
  border-radius: 50px;
  font-size: 20px;
  margin: 0 50px;
  font-weight: bolder;
  border: none;
  margin-top: 30px;
}
.myvege_popup{
  width: 400px;
  z-index: 10;
  border-radius: 20px;
  padding: 20px;
  background-color: white;
  margin:  20px ;

}
.myvege_popup h1{
  border-bottom: 1px solid var(--text-color);
  font-size: 24px;
  font-weight: bolder;
}
.myvege_popup button{
  margin: 10px 5px;
}
.myvege_popup img{
  height: 60px;
  width:60px;
  object-fit: contain;
}
.blackback{
  position: fixed ;
  height: calc(100vh - 60px);
  width: 100vw;
  top: 60px;
  left: 0;
  z-index: 5;
  background-color: rgba(3,3,3,0.5);;
}
.myvege_form{
  display: flex;
  margin-top: 10px;
}
.form_check{
  display: flex;
}
.myvege_form p{
  font-size: 20px;
  width: 80px;
  margin: auto 0;
}
.reg3_button{
  width: 400px;
  margin: auto;
}
.reg3_button >button{
  background-color: var(--main-color);
  color: white;
  padding: 10px 50px;
  border-radius: 50px;
  font-size: 20px;
  margin: 0 20px;
  font-weight: bolder;
  border: none;
  margin-top: 10px;
}
.chack_data{
  display: flex;
  width: 900px;
  margin: 0 auto;
}
@media (max-width: 575.98px) { 
  .myvege_popup{
    width: 340px;
    margin: 20px auto;
  }
  .myvege_form p{
    font-size: 16px;
    width: 50px;
  }
  .chack_data{
    width: 340px;
  }
}
</style>
