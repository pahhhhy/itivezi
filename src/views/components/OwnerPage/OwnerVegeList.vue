<script setup lang="ts">
import { ref,  onMounted ,computed} from 'vue'
import{useVegeListStore} from "../../../stores/vegeList"
interface Props {
  vegeKeys: string[],
  vegeAllData: any
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const isActive=ref<boolean>(false)
const vegeListStore=useVegeListStore()
const vegeList=computed(
    ():string[]=>{
        return vegeListStore.vegeList
    }
)
function pushActive () {
    isActive.value=!isActive.value
}
</script>
<template>
    <select class="form-select" aria-label="roadsideStationSelect">
        <option selected value="0">道の駅 川崎</option>
        <option value="1">道の駅 室根</option>
    </select>
    <h1 class="vege-title">現在注文可能な野菜のリスト</h1>
    <article v-if="!isActive">
        <div class="vegeList-group" >
            <div v-for="element in props.vegeKeys" :key="element">
                {{ element }}
            </div>
        </div> 
        <button v-on:click="pushActive" class="vegeList-button">編集する</button>
    </article>
    <article v-if="isActive">
        <div class="vegeList-group-active" >
            <div v-for="element in props.vegeKeys" :key="element">
                {{ element }}
            </div>
        </div> 
        <button v-on:click="pushActive" class="vegeList-button">更新する</button>
    </article>
</template>
<style>
.vege-title{
    margin-top: 20px;
}
.vegeList-group{
    margin: 10px;
    font-size:large
}
.vegeList-group-active{
    margin: 10px;
    font-size:large
}
.vegeList-button{
    background-color: white;
    font-size: 1.2rem;
    padding: 5px;
    margin:5px;
    border-radius: 10px;
}
</style>