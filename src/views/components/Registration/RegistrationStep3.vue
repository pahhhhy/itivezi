<script setup lang="ts">
import { ref } from 'vue'
import { type User } from 'firebase/auth'
import { useVegeStore } from '@/stores/vege'
interface Vegetables{
    [key:string]:{
        [key:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:string
            uid:string
            unit:string
            photo:string
        }
    }
}
interface Props {
  vegeKeys: string[]
  vegeList: number[]
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
      <h1>{{ vegeName }}</h1>
      <!-- {{ element }} -->
      <img :src="element[props.uniqueKey].photo" alt="" v-if="element[props.uniqueKey].photo!='none'">
      <img v-if="element[props.uniqueKey].photo=='none'" src="../../../assets/Noimage.jpeg"> 
      <h1>名前：{{ element[props.uniqueKey].farmer }}</h1>
      <h1>
        単価：{{ element[props.uniqueKey].unit  }} 
      </h1>
      <h1>価格：{{ element[props.uniqueKey].en }}円</h1>
      <h1>卸先:{{element[props.uniqueKey].roadStation }}</h1>
    </div>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
    <button v-on:click="vegeWriteHandler" class="btn btn-primary">送信</button>
  </section>
  <div class="card popup" style="width: 30rem" v-show="finishSend">
    <div class="card-body">
      <h5 class="card-title">送信が完了しました</h5>
      <button v-on:click="refreshPage" class="btn btn-primary">初めに戻る</button>
    </div>
  </div>
</template>
<style>
.confirm {
  border: 1px solid gray;
  border-radius: 10px;
  margin: 0 55px;
}
.chack_data img{
  width: 300px;
  height: 200px;
}
</style>
