<script setup lang="ts">
import { ref} from 'vue'
import { type User} from 'firebase/auth'
import { useSortVegeStore } from '@/stores/sortByVege';

import draggable from 'vuedraggable'
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
  }
enum SortMode{
    All="all",
    Kawasaki="川崎",
    Murone="室根",
    Other="その他"
}
interface Vegetables{
    [VegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string[]
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
    }
}
interface Props {
  data:Vegetables
  unavailableVegeList:string[]
  currentUser:User|null
  role:Role
}
interface Emits {
  (event: 'deleteIcon', vegeName: string): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const isActive = ref<boolean>(false)
const vegeKeys=ref<string[]>(Object.keys(props.data))
const sortVegeStore=useSortVegeStore()
const sortMode=ref<SortMode>(SortMode.All)
const VegeData=ref<Vegetables>()
function initData(){
  if(props.role==Role.Kawasaki){
  sortMode.value=SortMode.Kawasaki
}else if(props.role==Role.Murone){
  sortMode.value=SortMode.Murone
}else{
  VegeData.value=props.data
}
}
initData()
async function pushActive() {
  if(isActive.value){
    await sortVegeStore.update(vegeKeys.value,sortMode.value)
  }
  isActive.value = !isActive.value
  

}

function pushDeleteIcon(vegeName: string) {
  emit("deleteIcon",vegeName)
}
function pushExport() {
  const now = new Date()
  const currentTime= now.toLocaleString()
  const CSVfile= convertVegetablesToCSV(props.data);
  exportToCSV(CSVfile, "vegeList_" + currentTime)
}
function convertVegetablesToCSV(vegetables: Vegetables): string[][] {
  const headers = ["野菜の名前", "個数", "金額"]; // CSVのヘッダー
  const csvData: string[][] = [headers]; // ヘッダーを最初に追加

  Object.keys(vegetables).forEach(vegeName => {
    Object.keys(vegetables[vegeName]).forEach(uniqueKey => {
      const item = vegetables[vegeName][uniqueKey];
      csvData.push([
        vegeName,           // "野菜の名前"
        item.unit,          // "unit"
        item.en.toString()  // "money" (en は number なので文字列に変換)
      ]);
    });
  });

  return csvData;
}

function exportToCSV(data: string[][], fileName: string) {
  const csvRows: string[] = [];

  // データ行を追加
  for (const row of data) {
    const values = row.map((value: any) => {
      const escapeValue = String(value).replace(/"/g, '""');
      return `"${escapeValue}"`;
    });
    csvRows.push(values.join(','));
  }

  // CSV文字列を作成
  const csvString = csvRows.join('\n');

  // BOMを追加してCSVファイルを生成
  const bom = '\uFEFF'; // BOMを追加
  const blob = new Blob([bom + csvString], {type: 'text/csv;charset=utf-8;'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
</script>
<template>
  <!-- {{ VegeData }} -->
      <h1 class="vege-title" v-if="props.role==Role.Onwer">現在全ての注文可能な野菜のリスト</h1>
      <h1 class="vege-title" v-if="props.role!=Role.Onwer">現在{{props.role}}の注文可能な野菜のリスト</h1>
      <article v-if="!isActive">
        <div class="vegeList-group">
          <div v-for="(element,vegeName) in props.data" :key="vegeName">
            {{ vegeName }}
          </div>
        </div>
        <p>※これは初期配置です。本当の並び順とは違うことがあります</p>
        <button v-on:click="pushActive" class="vegeList-button">編集する</button>
      </article>
      <article v-if="isActive">
        <p>ドラック＆ドロップで並べ替えができます</p>
        <div class="vegeList-group-active">
          <draggable v-model="vegeKeys" draggable=".vegeList-unit-active" item-key="id">
            <template #item="{ element }">
              <div class="vegeList-unit-active">
                <p>・{{ element }}</p>
                <div class="vegeList-unit-icon-active">
                  <button v-on:click="pushDeleteIcon(element)"><i class="bi bi-trash3"></i></button>
                </div>
              </div>
            </template>
          </draggable>
          
        </div>
        <button v-on:click="pushActive" class="vegeList-button">更新する</button>
        <button v-on:click="pushExport" class="vegeList-button">出力する</button>
        <p>※出力するを押すと、現在注文可能な野菜の[名前、単位、値段]のリストが出力されます</p>
      </article>
      <div v-if="props.unavailableVegeList.length!=0">
        <h1 class="vege-title" v-if="props.role==Role.Onwer">現在全体で在庫切れの野菜</h1>
        <h1 class="vege-title" v-if="props.role!=Role.Onwer">現在{{props.role}}で在庫切れの野菜</h1>
        <div v-for="(vegeName) in props.unavailableVegeList" :key="vegeName">
          {{ vegeName }}
        </div>
      </div>
</template>
<style scoped>

</style>