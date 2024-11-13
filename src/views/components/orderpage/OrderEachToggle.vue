<script setup lang="ts">
import { ref} from 'vue'
import OrderToggleElement from './OrderToggleElement.vue';
import router from '@/router'

enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface datatables{
        [key:string]:{
            en:number;
            farmer:string
            roadStation:string[]
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
const IsPopup=ref<boolean>(false)
function onPushPopup(){
    IsPopup.value=true
}
function onPushOk(){
    IsPopup.value=false
}
function onPushCart(){
    router.push('/cart')
}
</script>
<template>
    <button class="Order_title">
        <h1>{{props.vegeName}}</h1>
    </button>
    <article class="vege_group" >
        <div v-for="(element,unique) in data" :key="unique" >
            <OrderToggleElement
            v-bind:data="element"
            v-bind:unique-key="unique"
            v-bind:vege-name="vegeName"
            v-on:on-push-popup="onPushPopup"></OrderToggleElement>
        </div>
    </article>
    <article v-if="IsPopup" class="Toggle_popup">
        <h2>カードに入れました</h2>
            <button v-on:click="onPushOk">了解</button>
            <button v-on:click="onPushCart">カートへ</button>
    </article>
    <!-- <h4>{{props.data}}</h4> -->
</template>
<style scoped>
.Toggle_popup{
    position: fixed;
    z-index: 1;
    border: 1px solid gray;
    border-radius: 20px;
    top: 20%;
    left: 20%;
    padding: 20px;
    background-color: white;
}
    .Order_title{
        border: none;
        background-color: var(--background-color);
        display: flex;
        align-items: center;
        color: var(--text-color);
    }
    .vege_group{
        display: flex;
    }
</style>