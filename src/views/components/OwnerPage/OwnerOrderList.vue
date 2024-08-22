<script setup lang="ts">
import { ref,  onMounted ,computed} from 'vue'
interface Props {
  vegeAllOrder:any
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
    function pushActive () {
    isActive.value=!isActive.value
}
function makeOrderList() {
    let orderKeys = Object.keys(props.vegeAllOrder);
    let resultList: any = {};
    for (let i = 0; i < orderKeys.length; i++) {
        let timeKeys = Object.keys(props.vegeAllOrder[orderKeys[i]]);
        
        for (let j = 0; j < timeKeys.length; j++) {
            // timeKeys[j]を使ってアクセスするように修正
            resultList[timeKeys[j]] = props.vegeAllOrder[orderKeys[i]][timeKeys[j]];
            const formattedKey = timeKeys[j].split('-').slice(0, 3).join('/'); 
            resultList[timeKeys[j]] ["key"]=formattedKey
            resultList[timeKeys[j]] ["unique"]=orderKeys[i]
        }
    }
    // キーでソートする
    const sortedData = Object.fromEntries(
        Object.entries(resultList).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    );
    let sortedDataKeys=Object.keys(sortedData)
    selectedTableList.value=new Array(sortedDataKeys.length).fill(false)
    return sortedData;
}
function selectOrderData(index: number) {
  selectedTableList.value[index]=!selectedTableList.value[index]
}
// 選択されたインデックスを保存するための状態
const selectedIndex = ref<number | null>(null);
const isActive=ref<boolean>(false)
const selectedTableList=ref<boolean[]>([])
const sortedOrderData=ref<any>(makeOrderList())
console.log(sortedOrderData.value)
</script>
<template>
<h1>注文履歴</h1>
<!-- {{ sortedOrderData }} -->
<article v-if="!isActive">
    <div class="orderList-group" >
        <div class="order-table">
            <p>注文時間</p>
            <p>名前</p>
            <p>連絡</p>
        </div>
        <div  v-for="(element) in sortedOrderData" :key="element" class="order-table" >
            <p>{{element["key"]}}</p>
            <p>{{element["orderName"]}}</p>
            <p>{{element["state"]}}</p>
        </div>
    </div> 
    <button v-on:click="pushActive" class="orderList-button">確認する</button>
</article>
<article v-if="isActive">
    <div class="orderList-group-active" >
        <div class="order-table">
            <p>注文時間</p>
            <p>名前</p>
            <p>連絡</p>
        </div>
        <div v-on:click="selectOrderData(index)" v-for="(element,time,index) in sortedOrderData" :key="element" class="order-table-active" >
            <p>{{element["key"]}}</p>
            <p>{{element["orderName"]}}</p>
            <p>{{element["state"]}}</p>
            <div class=".order-table-selected" v-if="selectedTableList[index]">
                <p>{{element["key"]}}</p>
                <p>{{element["orderName"]}}</p>
                <p>{{element["state"]}}</p>
            </div>
        </div>
    </div> 
    <button v-on:click="pushActive" class="orderList-button">更新する</button>
</article>
</template>
<style>
.order-table{
    display: flex;
    align-items:center ;
    justify-content: space-around;
    
}
.order-table-selected{
display: block;
}
.order-table-active{
    display: flex;
    align-items:center ;
    justify-content: space-around;
    cursor: pointer;
}

.orderList-group{
    margin: 10px;
    font-size:large
}
.orderList-group-active{
    margin: 10px;
    font-size:large
}
.orderList-button{
    background-color: white;
    font-size: 1.2rem;
    padding: 5px;
    margin:5px;
    border-radius: 10px;
}</style>