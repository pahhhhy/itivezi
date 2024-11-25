<script setup lang="ts">
import { ref,computed} from 'vue'
import { useRouter } from 'vue-router';
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface OrdertablesElement{
  [num:number]:{
    en:number;
    farmer:string
    roadStation:string[]
    state:VegeState
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}
  orderTime:string
  email:string
  orderName:string
  selectData:string
  state:string
  totalMoney:number
}
interface orderVegeElementTables{
    [num:number]:{
    en:number;
    farmer:string
    roadStation:string[]
    state:VegeState
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}
}
interface Props {
  data:OrdertablesElement
  unique:string|number
}

const props = defineProps<Props>()
  const vegeElementList=ref<orderVegeElementTables>(getNumData(props.data))
  const images=ref<string[]>(getImg(vegeElementList.value))
  const titlename=ref<string>(getTitle(vegeElementList.value))
  const orderDay=ref<string>(formatDate(props.data.orderTime))
  const router = useRouter();
  const navigateToDetail = (unique:string|number) => {
      router.push({ name: 'my-page-order', params: { unique } }); // 'DynamicPage' はルート名
    };
function getNumData(orderTable: OrdertablesElement) {
  // 数値キーに対応する部分を取り出す
  const numData = Object.keys(orderTable)
    .filter((key) => !isNaN(Number(key))) // 数値のキーのみを抽出
    .map((key) => orderTable[Number(key)]); // 数値のキーに対応するデータを取得

  return numData;
}
function getTitle(data:orderVegeElementTables){
  let result:string=""
  for(let i :number=0;i<Object.keys(data).length;i++){
    result=result+data[i].VegeName
    if(i!=Object.keys(data).length-1){
      result=result+"、"
    }
  }
  return result
}
function getImg(data:orderVegeElementTables){
  let resultimages:string[]=[]
  for(let i :number=0;i<Object.keys(data).length;i++){
    resultimages[i]=data[i].photo
    if(i==3)break;
  }
  return resultimages
}
function formatDate(input:string) {
  // 入力をスプリットして配列に変換
  const [year, month, day] = input.split('-');
  // フォーマットを `YYYY/MM/DD` に変換
  return `${year}/${month}/${day}`;
}
const gridClass = computed(() => {
  const itemCount = Object.keys(vegeElementList.value).length;
  console.log("Item Count:", itemCount);
  switch (itemCount) {
    case 1:
      return "grid-one";
    case 2:
      return "grid-two";
    case 3:
      return "grid-three";
    case 4:
      return "grid-four";
    default:
      return "grid-four";
  }
});
</script>
<template>
  <article class="myorder_element" v-on:click="navigateToDetail(props.unique)">
    <div v-bind:class="gridClass" class="image-container">
      <div v-for="(image, index) in images" :key="index" class="image-item">
        <img v-if="image!='none'" :src="image" alt="画像" />
        <img src="../../../assets/Noimage.jpeg" alt="..." v-if="image=='none'">
      </div>
    </div>
    <div class="name_time">
      <h4>{{titlename}}</h4>
      <p>注文日：{{orderDay}}</p>
    </div>
    <button ><i class="bi bi-chevron-right"></i></button>
  </article>
</template>
<style scoped>
.myorder_element{
  display: flex;
  height: 50px;
  border-top:1px solid var(--line-color) ;
  border-bottom:1px solid var(--line-color) ;
  width: 270px;
}
.myorder_element button{
  border: none;
  background-color: white;
  
}
.name_time{
  width: 150px;
  height: 100%;
}
.name_time h4{
  white-space: nowrap; /* テキストを1行に制限 */
  overflow: hidden;    /* はみ出した部分を非表示にする */
  text-overflow: ellipsis; /* はみ出した部分を「...」にする */
  font-size: 18px;
  margin: 0;
}
.name_time p{
  margin: 0;
  font-size: 14px;
}
.image-container {
  display: grid;
  width: 80px;
  height: 50px;
}
.image-item {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.image-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.grid-one {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.grid-two {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-three {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "image1 image2"
    "image3 image3";
}

.grid-four {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
</style>