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
interface FarmerList{
  [farmerName:string]:{
    [VegeName:string]:{
    unit:string
    en:number
  }
  };
}
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
  roadStationUnitTempList.value.unshift("全て");
const selectedRoadStation = ref<string>(roadStationUnitTempList.value[0])
const groupByFarmerList = ref<FarmerList>({})
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
  groupByFarmerList.value  = classifyVegetablesByFarmer(fliterOrderData)
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

function classifyVegetablesByFarmer(vegeTables: Vegetables): FarmerList {
    const farmerList: FarmerList = {};

    for (const vegeName in vegeTables) {
        const uniqueKeys = vegeTables[vegeName];

        for (const uniqueKey in uniqueKeys) {
            const element = uniqueKeys[uniqueKey];
            const farmerName = element.farmer;

            // 農家がリストにない場合、初期化
            if (!farmerList[farmerName]) {
                farmerList[farmerName] = {};
            }

            // 野菜名が農家にまだ登録されていない場合、追加
            if (!farmerList[farmerName][vegeName]) {
                farmerList[farmerName][vegeName] = {
                    unit: element.unit,
                    en: element.en
                };
            } else {
                // もしすでに同じ野菜が存在する場合、enを合計する（必要に応じて）
                farmerList[farmerName][vegeName].en += element.en;
            }
        }
    }

    return farmerList;
}

function pushExport() {
  let CSVfile = convertToCSV(groupByFarmerList.value)
  const now = new Date()
  const currentTime = now.toLocaleString()
  let fileName = "出品者リスト_" + selectedRoadStation.value + "_" + currentTime
  downloadCSV(CSVfile, fileName)
}

const convertToCSV = (data: FarmerList): string => {
  // CSVのヘッダー
  const headers = ["名前", "野菜", "値段", "単位"];
  const rows: string[] = [];

  // データをフラット化してCSV用に整形
  Object.entries(data).forEach(([farmer, vegetables]) => {
    Object.entries(vegetables).forEach(([vegetable, details]) => {
      rows.push([farmer, vegetable, details.en.toString(), details.unit].join(","));
    });
  });

  // ヘッダーとデータを結合
  return [headers.join(","), ...rows].join("\n");
};


// ブラウザでCSVファイルをダウンロードさせる関数
// ブラウザでCSVファイルをダウンロードさせる関数
const downloadCSV = (csv: string, filename: string) => {
  const bom = "\uFEFF"; // BOMを追加
  const blob = new Blob([bom + csv], {type: "text/csv;charset=utf-8;"});
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
<template>
  <h1>出品者リスト</h1>
  <!-- {{ groupByFarmerList }} -->
  <!-- {{ vegeAllData }} -->
  <select class="form-select" aria-label="roadsideStationSelect" v-model="selectedRoadStation" @change="initData">
    <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation>
      {{ roadStation }}
    </option>
  </select>
  <div v-for="(element,farmer) in groupByFarmerList" :key="farmer">
    <OwnerFarmerListElement
    v-bind:-farmer-name="farmer"
    v-bind:-vege-data="element"></OwnerFarmerListElement>
  </div>
  <button class="export-button" v-on:click="pushExport()">出力する</button>
</template>
<style>
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