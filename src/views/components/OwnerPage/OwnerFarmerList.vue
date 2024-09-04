<script setup lang="ts">
import{ useRoadStationStore}from "../../../stores/roadStation"
import { ref} from 'vue'
import { getDatabase, ref as fireRef,  onValue} from 'firebase/database'
type Data = {
  [key: string]: {
    [key: string]: {
      en: number;
      farmer: string;
      state: string;
      uid: string;
      unit: string;
    };
  };
};

type Result = {
  [farmer: string]: number;
};
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const selectdRoadStation=ref<string>(roadStationUnitTempList.value[0])
const vegeAllData=ref<any>(null)
const vegeKeys=ref<string[]>([])
const countFarmerList=ref<any>([])
const selectedTableList=ref<boolean[]>([])
const groupByFarmerList=ref<any>([])
async function initData(){
    vegeAllData.value=await readvegeAllData(selectdRoadStation.value)
    vegeAllData.value=filterDiscontinuedItems(vegeAllData.value)
    vegeKeys.value=Object.keys(vegeAllData.value)
    countFarmerList.value=countFarmers(vegeAllData.value)
    groupByFarmerList.value=groupByFarmer(vegeAllData.value)
}
initData()
const filterDiscontinuedItems = (data: any) => {
  const filteredData: any = {};
  const excludedItems: any = {};  // 排除されたアイテムを保存するオブジェクト
  const allDiscontinuedCategories: string[] = [];  // すべてが "Discontinued" のカテゴリ名を保存する配列
  
  for (const [category, items] of Object.entries(data) as [string, any]) {
    const filteredItems: any = {};
    const excludedCategoryItems: any = {};  // このカテゴリーで排除されたアイテム
    let allDiscontinued = true;  // すべてが "Discontinued" かどうかをチェックするフラグ

    for (const [id, item] of Object.entries(items as any) as [string, any]) {
      if (item.state !== "Discontinued") {
        filteredItems[id] = item;
        allDiscontinued = false;  // "Discontinued" でないアイテムがあればフラグをfalseに
      } else {
        excludedCategoryItems[id] = item;  // 排除されたアイテムを保存
      }
    }

    if (Object.keys(filteredItems).length > 0) {
      filteredData[category] = filteredItems;
    }
    if (Object.keys(excludedCategoryItems).length > 0) {
      excludedItems[category] = excludedCategoryItems;
    }

    if (allDiscontinued) {
      allDiscontinuedCategories.push(category);  // すべてが "Discontinued" ならカテゴリ名を保存
    }
  }
  return filteredData;
};
function readvegeAllData(roadStation: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testVege/' + roadStation + "/")
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}
function countFarmers(data: Data): Result {
  const result: Result = {};

  Object.values(data).forEach(vegeData => {
    Object.values(vegeData).forEach(record => {
      const { farmer } = record;
      if (result[farmer]) {
        result[farmer]++;
      } else {
        result[farmer] = 1;
      }
    });
  });
  selectedTableList.value=new Array(result.length).fill(false)
  return result;
};
function pushFarmer(index:number){
    selectedTableList.value[index]=!selectedTableList.value[index]
}
function groupByFarmer (data: Data): Result  {
  const result: any = {};

  Object.entries(data).forEach(([vegetable, records]) => {
    Object.entries(records).forEach(([id, record]) => {
      const { farmer, ...rest } = record;
      if (!result[farmer]) {
        result[farmer] = {};
      }
      if (!result[farmer][vegetable]) {
        result[farmer][vegetable] = [];
      }
      result[farmer][vegetable].push(rest);
    });
  });

  return result;
};
function pushExport(){
  let CSVfile=convertToCSV(groupByFarmerList.value)
  const now = new Date()
  const currentTime = now.toLocaleString()
  let fileName="出品者リスト_"+selectdRoadStation.value+"_"+currentTime
  downloadCSV(CSVfile,fileName)
}
// CSVに変換する関数
const convertToCSV = (data: any): string => {
  // CSVのヘッダー
  const headers = ["名前", "野菜", "値段", "個数"];
  const rows: string[] = [];

  // データをフラット化してCSV用に整形
  Object.entries(data).forEach(([farmer, vegetables]) => {
    Object.entries(vegetables as any).forEach(([vegetable, entries]) => {
      // entriesは配列なので、ここでforEachを使用します
      (entries as any[]).forEach((entry: any) => {
        rows.push([farmer, vegetable, entry.en.toString(), entry.unit].join(","));
      });
    });
  });

  // ヘッダーとデータを結合
  return [headers.join(","), ...rows].join("\n");
};


// ブラウザでCSVファイルをダウンロードさせる関数
// ブラウザでCSVファイルをダウンロードさせる関数
const downloadCSV = (csv: string, filename: string) => {
  const bom = "\uFEFF"; // BOMを追加
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
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
<select class="form-select" aria-label="roadsideStationSelect" v-model="selectdRoadStation" @change="initData">
    <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation >{{roadStation}}</option>
</select>
<!-- {{vegeAllData}}
{{ countFarmerList }} -->
 <!-- {{ groupByFarmerList }} -->
 
<div v-for="(number,farmer,index) in countFarmerList" :key="farmer">
    <!-- {{ number }}
    {{ farmer }} -->
    <div class="farmarList-group">
        <button v-on:click="pushFarmer(index)">
            <h3>{{ farmer }}さん</h3>
            <h3>{{number}}件</h3>
            <i class="bi bi-chevron-down" v-if="!selectedTableList[index]"></i>
            <i class="bi bi-chevron-up" v-if="selectedTableList[index]"></i>
        </button>
        <div class="farmarList-group-element">
            <div v-for="(element,vege) in groupByFarmerList[farmer]" :key="vege" v-show="selectedTableList[index]" >
                <!-- {{ element }}
                {{vege}} -->
                <article>
                    <h3>{{vege}}</h3>
                    <p>{{ element[0].unit }}    {{element[0].en}}円</p>
                </article>
                
            </div>
        </div>
        
    </div>
</div>
<button class="export-button" v-on:click="pushExport()">出力する</button>
</template>
<style>
.export-button{
  background-color: white;
  margin-top: 20px;
}
.farmarList-group button{
    display: flex;
    width: 600px;
    margin: 0 20px ;
    background-color: white;
    border: none;
    border-top:1px solid gray ;
    border-bottom:1px solid gray ;
    justify-content: space-between;
}
.farmarList-group button i{
    display: flex;
    align-items: center;
    margin:auto 0;
}
.farmarList-group-element{
    display: flex;
    
}
.farmarList-group-element article{
    border: 1px solid gray;
    margin: 10px;
    border-radius: 20px;
    padding: 10px;
}
</style>