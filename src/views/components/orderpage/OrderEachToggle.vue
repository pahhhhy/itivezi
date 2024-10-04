<script setup lang="ts">
import { ref} from 'vue'
import OrderToggleElement from './OrderToggleElement.vue';
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface datatables{
        [key:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
}

interface Props {
    data:datatables
    vegeName:string|number
}
const props = defineProps<Props>()
const isActive=ref<boolean>(false)
function OnPushTitle(){
    isActive.value=!isActive.value
}
</script>
<template>
    <button class="Order_title" v-on:click="OnPushTitle">
        <h1>{{props.vegeName}}</h1>
        
        <i class="bi bi-chevron-down" v-if="!isActive"></i>
        <i class="bi bi-chevron-up" v-if="isActive"></i>
    </button>
    <article class="vege_group" v-if="isActive">
        <div v-for="(element,unique) in data" :key="unique" >
            <OrderToggleElement
            v-bind:data="element"
            v-bind:unique-key="unique"
            v-bind:vege-name="vegeName"></OrderToggleElement>
        </div>
    </article>
    
    <!-- <h4>{{props.data}}</h4> -->
</template>
<style scoped>
    .Order_title{
        border: none;
        background-color: white;
        display: flex;
        align-items: center;
    }
    .vege_group{
        display: flex;
    }
</style>