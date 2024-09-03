<script setup lang="ts">
import { ref,  onMounted ,computed} from 'vue'
import{ useRoadStationStore}from "../../../stores/roadStation"
import { getDatabase, ref as fireRef,  onValue, update } from 'firebase/database'
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const selectdRoadStation=ref<string>(roadStationUnitTempList.value[0])
interface Props {
  vegeAllOrder:any
}
const props = defineProps<Props>()
    function pushActive () {
    isActive.value=!isActive.value
}
function makeOrderList() {
    let roadStationOrderData=props.vegeAllOrder[selectdRoadStation.value]
    let orderKeys = Object.keys(roadStationOrderData);
    let resultList: any = {};
    for (let i = 0; i < orderKeys.length; i++) {
        let timeKeys = Object.keys(roadStationOrderData[orderKeys[i]]);
        
        for (let j = 0; j < timeKeys.length; j++) {
            // timeKeys[j]を使ってアクセスするように修正
            resultList[timeKeys[j]] = roadStationOrderData[orderKeys[i]][timeKeys[j]];
            const formattedKey = timeKeys[j].split('-').slice(0, 3).join('/'); 
            resultList[timeKeys[j]] ["key"]=timeKeys[j]
            resultList[timeKeys[j]] ["date"]=formattedKey
            resultList[timeKeys[j]] ["unique"]=orderKeys[i]
        }
    }
    // キーでソートする
    const sortedData = Object.fromEntries(
        Object.entries(resultList).sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
    );
    let sortedDataKeys=Object.keys(sortedData)
    selectedTableList.value=new Array(sortedDataKeys.length).fill(false)
    selectedTableUnitList.value= Object.entries(sortedData).reduce((acc, [dateTime, data]) => {
        // 数字キーだけを抽出
        const numericKeysData = Object.entries(data as any)
            .filter(([key]) => !isNaN(Number(key)))  // 数字キーだけをフィルタリング
            .reduce((innerAcc, [key, value]) => {
                innerAcc[key] = value;
                return innerAcc;
            }, {} as Record<string, any>);
        // 日時をキーとして、新しいオブジェクトに追加
        acc[dateTime] = numericKeysData;
        return acc;
    }, {} as Record<string, Record<string, any>>);
    return sortedData;
}
function selectOrderData(index: number) {
  selectedTableList.value[index]=!selectedTableList.value[index]
}
function updateState(element: string, unique: string, key: string): Promise<void> {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    update(fireRef(db, 'testOrders/' + selectdRoadStation.value + "/" + unique + "/" + key), { state: element })
      .then(() => {
        console.log("Update successful");
        resolve();
      })
      .catch((error) => {
        console.error("Update failed: ", error);
        reject(error);
      });
  });
}
async function changeState(element: string, unique: string, key: string){
    await updateState(element,unique,key)
    initData()
}
// 選択されたインデックスを保存するための状態
const isActive=ref<boolean>(false)
const selectedTableList=ref<boolean[]>([])
const selectedTableUnitList=ref<any>([])
const sortedOrderData=ref<any>({})
const state=ref<string[]>([])
function initData(){
    sortedOrderData.value= makeOrderList()
    let sortOrderDataKeys=Object.keys(sortedOrderData.value)
    for(let i:number=0;i<sortOrderDataKeys.length;i++){
        state.value[i]=sortedOrderData.value[sortOrderDataKeys[i]].state
    }
   
    }
    initData()
</script>
<template>
<h1>注文履歴</h1>
<select class="form-select" aria-label="roadsideStationSelect" v-model="selectdRoadStation" @change="initData">
    <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation >{{roadStation}}</option>
</select>
<!-- {{props.vegeAllOrder}} -->
<!-- {{ sortedOrderData }} -->
<!-- {{selectedTableUnitList["2024-8-22-11-22-0"]}} -->
<article v-if="!isActive">
    <div class="orderList-group" >
        <div class="order-table">
            <p>注文時間</p>
            <p>名前</p>
            <p>連絡</p>
        </div>
        <div  v-for="(element) in sortedOrderData" :key="element" class="order-table" >
            <p>{{element["date"]}}</p>
            <p>{{element["orderName"]}}</p>
            <p>{{element["state"]}}</p>
        </div>
    </div> 
    <button v-on:click="pushActive" class="orderList-button">確認する</button>
</article>
<article v-if="isActive">
    <div class="filter-nav">
        <h2>フィルター</h2>
        <div class="filter-unit">
            <button>未連絡</button>
            <button>連絡済み</button>
            <button>取引完了</button>
            <button>取引取り消し</button>
        </div>
    </div>
    <div class="orderList-group-active" >
        <div class="order-table">
            <p>注文時間</p>
            <p>名前</p>
            <p>状態</p>
            <p></p>
        </div>
        <div v-for="(element,time,index) in sortedOrderData" :key="element" class="order-table-active" >
            <div class="order-table-unit" v-on:click="selectOrderData(index)" >
                <!-- {{ element }} -->
                  
                <p>{{element["key"]}}</p>
            <p>{{element["orderName"]}}</p>
            <p>{{element["state"]}}</p>
            <i class="bi bi-chevron-down" v-if="!selectedTableList[index]"></i>
            <i class="bi bi-chevron-up" v-if="selectedTableList[index]"></i>
            </div>
            
            <div class="order-table-selected" v-if="selectedTableList[index]">
                <div v-for="(vegeData,number) in selectedTableUnitList[time]" v-bind:key="number" class="order-table-selected-unit">
                    <!-- {{vegeData}}[ "0", { "amount": 345, "farmerName": "三浦涼太郎", "price": 119025, "unit": "123本", "vegeName": "ジャガイモ" } ] -->
                     <!-- 上のような変数だから１を指定するとデータが取れる -->
                      <!-- {{ vegeData }} -->
                    <h3>{{vegeData["vegeName"]}}</h3>
                    <p>単位：{{vegeData["unit"]}}</p>
                    <p>個数：{{vegeData["amount"]}}組</p>
                    <p>農家名：{{vegeData["farmerName"]}}</p>
                    <p>料金：{{vegeData["price"]}}円</p>
                </div>
            </div>
            <div v-if="selectedTableList[index]" style="margin:0% 10%;">
                <p>希望日：{{element["selectDate"]}}</p>
                <p>合計金額:{{element["totalMoney"]}}円</p>
                <p style="display:flex">ステータス:<select class="form-select" aria-label="select-startyear" v-model="state[index]" v-on:change="changeState(state[index],element.unique,element.key)">
                    <option value="未連絡" >未連絡</option>
                    <option value="連絡済み" >連絡済み</option>
                    <option value="取引完了" >取引完了</option>
                    <option value="取引取り消し" >取引取り消し</option>
                  </select></p>
                

            </div>
        </div>
    </div> 
    <button v-on:click="pushActive" class="orderList-button">更新する</button>
</article>
</template>
<style>
.form-select{
    width: 30%!important;
}
.order-table{
    display: flex;
    align-items:center ;
    justify-content: space-around;
    border-bottom: 1px solid gray;
    border-top: 1px solid gray
}
.order-table-selected{
display: flex;
margin:0% 10%;

}
.order-table-unit{
    display: flex;
    align-items:center ;
    justify-content: space-around;
    cursor: pointer;
    border-bottom: 1px solid gray;
    border-top: 1px solid gray
}
.order-table-selected-unit{
    padding:3%
}
.orderList-group{
    margin: 10px;
    font-size:large
}
.orderList-group-active{
    
    font-size:large
}
.orderList-button{
    background-color: white;
    font-size: 1.2rem;
    padding: 5px;
    margin:5px;
    border-radius: 10px;
}</style>