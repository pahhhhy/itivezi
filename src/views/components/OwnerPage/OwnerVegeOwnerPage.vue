<script setup lang="ts">
import { ref} from 'vue'
import { type User} from 'firebase/auth'
import { useSortVegeStore } from '@/stores/sortByVege';
import router from '@/router'
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
  const isnone = ref<boolean>(false)
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
async function pushupdate() {
    await sortVegeStore.update(vegeKeys.value,sortMode.value)
    isActive.value=true
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
  const headers = ["野菜の名前","農家名", "金額", "個数"]; // CSVのヘッダー
  const csvData: string[][] = [headers]; // ヘッダーを最初に追加

  Object.keys(vegetables).forEach(vegeName => {
    Object.keys(vegetables[vegeName]).forEach(uniqueKey => {
      const item = vegetables[vegeName][uniqueKey];
      csvData.push([
        vegeName,           // "野菜の名前"
        item.farmer,
        item.en.toString()  ,
        item.unit, 
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
function onpushHeader(bool:boolean){
  isnone.value=bool
}
function pushOrder(){
  router.push("/order")
}
</script>
<template>
  <!-- {{ VegeData }} -->
    <article class="ownerVege_card">
      <h1 class="ownerVege_title" v-if="props.role==Role.Onwer">全ての野菜リスト</h1>
      <h1 class="ownerVege_title" v-if="props.role!=Role.Onwer">{{props.role}}の野菜のリスト</h1>

      <article class="Tab_menu">
        <div class="Tab_menu_header">
          <button class="Tab_menu_Vege" v-bind:class="{active:!isnone}" v-on:click="onpushHeader(false)">野菜リスト</button>
          <button class="Tab_menu_none" v-bind:class="{active:isnone}" v-on:click="onpushHeader(true)">在庫なし</button>
        </div>
        <div class="TAB_Body_Vege" v-if="!isnone">
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
        </div>
        <div class="TAB_Body_none" v-if="isnone">
        <div v-if="props.unavailableVegeList.length==0">在庫切れの商品はありません</div>
        <h3 class="vege-title" v-if="props.role==Role.Onwer&&props.unavailableVegeList.length!=0">現在全体で在庫切れの野菜</h3>
        <h3 class="vege-title" v-if="props.role!=Role.Onwer&&props.unavailableVegeList.length!=0">現在{{props.role}}で在庫切れの野菜</h3>
        <div v-for="(vegeName) in props.unavailableVegeList" :key="vegeName">
          {{ vegeName }}
        </div>
      </div>
      </article>
      <div v-if="isnone==false">
        <p>※これは初期配置です。本当の並び順とは違うことがあります</p>
        <button v-on:click="pushupdate" class="vegeList-button">更新する</button>
          <button v-on:click="pushExport" class="vegeList-button">出力する</button>
      </div>
      
      </article>  
      <article class="Update_popup" v-if="isActive">
        <h3>更新しました。</h3>
        <button v-on:click="pushOrder" class="vegeList-button">注文画面へ</button>
          <button v-on:click="isActive=false" class="vegeList-button">戻る</button>
      </article>
</template>
<style scoped>
.ownerVege_card{
  width: 340px;
  height: 740px;
  border-radius: 10px;
  background-color: white;
  margin: 0 auto;
  padding: 15px;
  margin-top: 20px;
}
.ownerVege_title{
  
  border-bottom: 1px solid black;
  padding-bottom: 5px;
}
.Tab_menu{
  width: 100%;
  height: 500px;
  margin-top: 20px;
  border: 1px solid var(--line-color);
}
.Tab_menu_header{
  width: 100%;
  height: 40px;
  display: flex;
  background-color: var(--background-color);
}
.Tab_menu_Vege{
  width: 50%;
  border-color: var(--line-color);
}
.Tab_menu_Vege.active{
  border-radius: 20px 20px 0 0;
  background-color: white;
  border-bottom: none;
}
.Tab_menu_none{
  width: 50%;
  border-color: var(--line-color);
}
.Tab_menu_none.active{
  border-radius: 20px 20px 0 0;
  background-color: white;
  border-bottom: none;
}
.TAB_Body_none{
  font-size: 20px;
  margin: 10px;
}
.Update_popup{
  position: fixed;
  width: 340px;
  z-index: 10;
  border: 1px solid gray;
  border-radius: 20px;
  top: calc(50% - 150px);
  left: calc(50% - 170px);
  padding: 20px;
  background-color: white;
}
.Update_popup p{
  font-size: 20px;
}
</style>