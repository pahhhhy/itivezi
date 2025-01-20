<script setup lang="ts">
import {useRoadStationStore} from "../../../stores/roadStation"
import {ref,watch} from 'vue'
import { useVegeStore } from '@/stores/vege'
import OwnerFarmerListElement from "./OwnerFarmerListElement.vue";
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:vegeElementTables
    }
}
interface vegeElementTables{
  en:number
  farmer:string
  roadStation:string[]
  state:VegeState
  uid:string
  unit:string
  photo:string
}
interface CountTable{
  farmer:string,
  count:number
}
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
  if (!roadStationUnitTempList.value.includes("全て")) {
    roadStationUnitTempList.value.unshift("全て");
}
  
const selectedRoadStation = ref<string>(roadStationUnitTempList.value[0])
const AllfarmerCount = ref<CountTable[]>([])
const isfliter=ref<boolean>(false)
  watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
  initData()
});
async function initData() {
  //disableを消して
  vegeAllData.value =removeDiscontinuedVegetables(vegeAllData.value)
  let fliterOrderData =vegeAllData.value
  //道の駅ごとにフィルターをやって
  if(selectedRoadStation.value=="全て"){
    fliterOrderData=vegeAllData.value
  }else{
    fliterOrderData= filterByRoadStation(vegeAllData.value,selectedRoadStation.value)
  }
  //農家ごとのデータを作成する
  AllfarmerCount.value  = countAllFarmers(fliterOrderData)
}

initData()
function filterByRoadStation  (vegeTables: Vegetables,mode:string): Vegetables {
  const filtered: Vegetables = {};

  Object.entries(vegeTables).forEach(([vegeName, uniqueEntries]) => {
    const filteredEntries: { [uniqueKey: string]: vegeElementTables } = {};

    Object.entries(uniqueEntries).forEach(([uniqueKey, entry]) => {
      // roadStationの配列に"室根"が含まれているかチェック
      if (entry.roadStation.includes(mode)) {
        filteredEntries[uniqueKey] = entry;
      }
    });

    // フィルタリング後にデータが残っている場合のみ追加
    if (Object.keys(filteredEntries).length > 0) {
      filtered[vegeName] = filteredEntries;
    }
  });

  return filtered;
};
function removeDiscontinuedVegetables(vegetables: Vegetables): Vegetables {
    const filteredVegetables: Vegetables = {};

    // 各野菜名ごとにループ
    for (const vegeName in vegetables) {
        const vegeEntries = vegetables[vegeName];
        const filteredEntries: { [uniqueKey: string]: vegeElementTables } = {};

        // uniqueKey ごとにループ
        for (const uniqueKey in vegeEntries) {
            const vegeEntry = vegeEntries[uniqueKey];

            // state が Discontinued でない場合にのみフィルタリング
            if (vegeEntry.state !== VegeState.Discontinued) {
                filteredEntries[uniqueKey] = vegeEntry;
            }
        }

        // フィルタリング後にエントリがある場合にのみ追加
        if (Object.keys(filteredEntries).length > 0) {
            filteredVegetables[vegeName] = filteredEntries;
        }
    }

    return filteredVegetables;
}

function countAllFarmers(vegeTables: Vegetables): CountTable[] {
  const farmerCounts: { [farmer: string]: number } = {};

  for (const vegeName in vegeTables) {
    const uniqueKeys = vegeTables[vegeName];

    for (const uniqueKey in uniqueKeys) {
      const element = uniqueKeys[uniqueKey];
      const farmerName = element.farmer;

      // 農家名をキーにしてカウント
      farmerCounts[farmerName] = (farmerCounts[farmerName] || 0) + 1;
    }
  }

  // CountTable形式に変換して返す
  return Object.entries(farmerCounts).map(([farmer, count]) => ({ farmer, count }));
}



// function pushExport() {
//   let CSVfile = convertToCSV(groupByFarmerList.value)
//   const now = new Date()
//   const currentTime = now.toLocaleString()
//   let fileName = "出品者リスト_" + selectedRoadStation.value + "_" + currentTime
//   downloadCSV(CSVfile, fileName)
// }

// const convertToCSV = (data: FarmerList): string => {
//   // CSVのヘッダー
//   const headers = ["名前", "野菜", "値段", "単位"];
//   const rows: string[] = [];

//   // データをフラット化してCSV用に整形
//   Object.entries(data).forEach(([farmer, vegetables]) => {
//     Object.entries(vegetables).forEach(([vegetable, details]) => {
//       rows.push([farmer, vegetable, details.en.toString(), details.unit].join(","));
//     });
//   });

//   // ヘッダーとデータを結合
//   return [headers.join(","), ...rows].join("\n");
// };


// ブラウザでCSVファイルをダウンロードさせる関数
// ブラウザでCSVファイルをダウンロードさせる関数
// const downloadCSV = (csv: string, filename: string) => {
//   const bom = "\uFEFF"; // BOMを追加
//   const blob = new Blob([bom + csv], {type: "text/csv;charset=utf-8;"});
//   const link = document.createElement("a");
//   const url = URL.createObjectURL(blob);
//   link.setAttribute("href", url);
//   link.setAttribute("download", filename);
//   link.style.visibility = "hidden";
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };
function onpushfilter(){
  isfliter.value=!isfliter.value
}
</script>
<template>
  <article class="farmerList-card">
    <h1>出品者リスト</h1>
    <button v-on:click="onpushfilter">
      フィルター
      <i class="bi bi-chevron-down" v-if="!isfliter"></i>
      <i class="bi bi-chevron-up" v-if="isfliter"></i>
    </button>
    <article class="filter-tab" v-if="isfliter">
      <h3>ステータス</h3>
      <div class="fliter-button-group">
        <div v-for="(element,index) in roadStationUnitTempList" v-bind:key="index" class="filter_button">
          <input
            class="form-check-input"
            type="radio"
            :value="element"
            v-model="selectedRoadStation"
            v-on:click="initData()"
            :id="'flexCheckIndeterminate' + index"
          />
          <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
            {{ element }}
          </label>
      </div>
      
      </div>
      
    </article>
    <article v-if="Object.keys(AllfarmerCount).length==0">データがありません</article>
    <article v-if="Object.keys(AllfarmerCount).length!=0">
      <div v-for="(element,farmer) in AllfarmerCount" :key="farmer" >
        <OwnerFarmerListElement
        v-bind:-farmer-name="element.farmer"
        v-bind:road-station="selectedRoadStation"
        v-bind:count="element.count"></OwnerFarmerListElement>
      </div>
        <!-- <button class="export-button" v-on:click="pushExport()">出力する</button> -->
    </article>
    
  </article>
  
</template>
<style>
.farmerList-card{
  width: 340px;
  padding: 10px;
  border-radius: 10px;
  background-color: white;
  margin: 0 auto;
  margin-top: 20px;
}
.farmerList-card h1{
  border-bottom: 1px solid black;
}
.farmerList-card button{
  height: 40px;
  width: 100px;
  border-radius: 5px;
  color: white;
  text-align: center;
  background-color: var(--other-color);
  border: none;
  margin: 10px 10px;

}
.filter-tab{
  border-radius: 10px;
  border: 1px solid var(--line-color);
  padding: 10px;
  margin: 10px 0;;
}
.filter-tab h3{
  border-bottom: 1px solid black;
}
.fliter-button-group{
  display: flex;
  flex-wrap: wrap;
  
}
.filter_button{
  width: 120px;
}
.export-button {
  background-color: white;
  margin-top: 20px;
}


.farmerList-group-element article {
  border: 1px solid gray;
  margin: 10px;
  border-radius: 20px;
  padding: 10px;
}
</style>