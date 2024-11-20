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
    <article class="Order_card">
        <button class="Order_title">
            <h1>{{props.vegeName}}</h1>
            <!-- <i class="bi bi-chevron-down"></i> -->
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
    </article>
    
    
    <article v-if="IsPopup" class="Toggle_popup">
        <h2>カードに入れました</h2>
            <button v-on:click="onPushOk">了解</button>
            <button v-on:click="onPushCart">カートへ</button>
    </article>
    <!-- <h4>{{props.data}}</h4> -->
</template>
<style scoped>
.Order_card{
    background-color: white;
    border-radius: 10px;
    border: none;
    width: 340px;
    height: 240px;
    padding: 15px ;
    margin: 10px auto;
}
.Order_title{
    width: 270px;
    margin: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    border: none;
    border-bottom:1px  solid  var(--text-color);
    background-color: white;
    color: var(--text-color);
}
.Order_title i{
    font-size: 25px;
}
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
    
    .vege_group{
        display: flex;
        overflow-x: scroll;
    }
</style>