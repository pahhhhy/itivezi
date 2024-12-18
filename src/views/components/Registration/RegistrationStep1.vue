<script setup lang="ts">
import { ref,watch } from 'vue'
import { useUserStore } from '@/stores/userData';
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
interface Props {
  vegeList: string[]
  vegeKeys: string[]
  uproadData:Vegetables
  uniquwKey:string|null
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'updateUproadData', element: Vegetables): void
  (event: 'changeSelectList', element: string[]): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const AllVegeList=ref<string[]>(props.vegeKeys)
const searchVegeList=ref<string[]>(AllVegeList.value)
const myName=ref<string|null|undefined>(currentUser.value?.displayName) 
const myUid=ref<string|undefined>(currentUser.value?.uid)
const searchText=ref<string>("")
const selectVege = ref<string>("")
  const selectVegeList = ref<string[]>(props.vegeList)
const step1Error = ref<boolean>(false)
const uproadData=ref<Vegetables>(props.uproadData)
  watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
  myName.value=currentUser.value?.displayName
  myUid.value=currentUser.value?.uid
});
function onStep(next:boolean) {
  if(!next)emit('OnStep', false)
  else{
    if (selectVegeList.value.length == 0) {
    step1Error.value = true
  } else {
    step1Error.value = false
    emit('OnStep', true)
  }
}
  
}
function changeVege() {
  if(props.uniquwKey&&myName.value&&myUid.value){
    for(let i:number=0;i<selectVegeList.value.length;i++){
    uproadData.value[selectVegeList.value[i]]={
    [props.uniquwKey]:{
      en: -1,
      farmer: myName.value,
      roadStation: [],
      state: VegeState.Available,
      uid: myUid.value,
      unit: "",
      photo: "none"
    }
  }
  }
  }else{
    console.error("myUidnaizo")
  }
  emit('updateUproadData', uproadData.value)
  emit("changeSelectList",selectVegeList.value)
}
// チェックボックスの状態が変わったときの関数
function handleCheckboxChange(item:string) {
  selectVege.value=item
  delete uproadData.value[selectVege.value]
  emit('updateUproadData', uproadData.value)
  emit("changeSelectList",selectVegeList.value)
}

// selectedVegeを監視して、変化を検知
watch(selectVegeList, (newVal, oldVal) => {
  const removedItems = oldVal.filter(item => !newVal.includes(item))
  if (removedItems.length > 0) {
    removedItems.forEach(item => handleCheckboxChange(item))
  }
})
function onPushX(element:string){
    selectVegeList.value=selectVegeList.value.filter(item=>item !== element)
}
//入力欄から野菜を絞り込む
async function searchVege(){

  if(searchText.value!=""){
   // 文字列をひらがなに統一する関数
   const toHiragana = (text: string): string =>
    text
      .normalize("NFKC") // 正規化（全角・半角を統一）
      .replace(/[\u30a1-\u30f6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60) // カタカナをひらがなに変換
      );

  // 入力テキストをひらがなに統一
  const normalizedSearchText = toHiragana(searchText.value);

  // 配列内の各要素をフィルタリング
  searchVegeList.value= AllVegeList.value.filter(item => toHiragana(item).includes(normalizedSearchText));
  }else{
    searchVegeList.value=AllVegeList.value
  }
}
</script>
<template>
  <!-- {{ uproadData }}
  {{ selectVege }} -->
  <section class="reg1_card">
    <h2>野菜を選択してください</h2>
    <div class="search_group">
      <input
        class="form-control"
        type="text"
        placeholder="野菜名を入力してください"
        aria-label="default input example"
        v-model="searchText"
        @input="searchVege"
      />
      <i></i>
    </div>
    <div class="select_group" v-if="selectVegeList.length!=0">
      <div class="select_element" v-for="(element) in selectVegeList" v-bind:key="element" >
        <p>{{element}}</p>
        <button v-on:click="onPushX(element)"><i class="bi bi-x-circle-fill"></i></button>
      </div>
    </div>
    <div class="form">
      <div class="form-check" v-for="(element, index) in searchVegeList" :key="element">
        <input
          class="form-check-input"
          type="checkbox"
          :value="element"
          v-model="selectVegeList"
          v-on:change="changeVege"
          :id="'flexCheckIndeterminate' + index"
        />
        <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
          {{ element }}
        </label>
      </div>
    </div>

    <!-- <p>Selected Vegetables: {{ selectVegeList }}</p> -->
    <h1 style="color: red" v-show="step1Error && selectVegeList.length == 0">
      野菜を選択してください
    </h1>
    <button v-on:click="onStep(true)" >次へ</button>
  </section>
</template>
<style>
.reg1_card{
  width: 800px;
  border: none;
  overflow:auto ;
  background-color: white;
  border-radius: 5px;
  margin :20px auto;
  padding: 5px 20px;
}
.reg1_card h2{
  border-bottom: 1px solid var(--text-color); 
}
.reg1_card>button {
  background-color: var(--main-color);
  color: white;
  padding: 10px 100px;
  border-radius: 50px;
  font-size: 20px;
  margin: 20px 20px;
  font-weight: bolder;
  border: none;
  margin-top: 30px;
}
.select_group{
  border-radius: 5px;
  border: 1px solid var(--line-color);
  width: 100%;
  padding: 5px;
}
.select_element{
  background-color: var(--line-color);
  display: inline-block;
  align-items: center;
  padding: 0 10px;
  border-radius: 5px;
  margin: 1px 5px;
}
.select_element button{
  background-color: var(--line-color);
  border: 0;
  display: inline-block;
}
.select_element p{
  margin-bottom: 0;
  display: inline-block;
  font-size: 20px;
}
.form{
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}
.form-check{
  min-width: 33%;
}
.form-check label{
  font-size: 20px;
}
.form-check input{
  height: 20px;
  width: 20px;
}
@media (max-width: 575.98px) { 
  .reg1_card{
    width: 340px;
  }
  .form-check{
    min-width: 50%;
  }
  .form-check label{
    font-size: 16px;
  }
  .form-check input{
    height: 16px;
    width: 16px;
  }
  .select_element p{
    font-size: 16px;
  }
}
</style>
