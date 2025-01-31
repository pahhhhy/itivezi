<script setup lang="ts">
import { ref,watch,onMounted,computed} from 'vue'
import { useRoute, type LocationQueryValue } from 'vue-router';
import { useFireOrderStore } from '@/stores/fireOrder';
import { useUserStore } from '@/stores/userData';
import { useVegeStore } from '@/stores/vege'
import router from '@/router'
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
const route = useRoute();
const name = ref<LocationQueryValue | LocationQueryValue[]>(route.query.name);
  const nameString = ref<string>(name.value ? String(name.value) : "")
const RoadStation = ref<LocationQueryValue | LocationQueryValue[]>(route.query.roadStation);
const RoadStationString =ref<string>(RoadStation.value ? String(RoadStation.value ) : "")
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const filteredData=ref<Vegetables>({})
const filteredVegeData=ref<Vegetables>({})
function initData(){  
  filteredVegeData.value=removeDiscontinuedVegetables(vegeAllData.value)
   filteredData.value= filterVegetablesByFarmerAndRoadStation(filteredVegeData.value,nameString.value,RoadStationString.value)
    
    
}
onMounted(() => {

  // データがロードされてから initData を呼ぶ
  watch(
    () => vegeStore.VegeAllData,
    (newData) => {
      vegeAllData.value=newData
        initData();
      
    },
    { immediate: true }
  );
});
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
function filterVegetablesByFarmerAndRoadStation(
  vegetables: Vegetables,
  farmerName: string,
  roadStation: string
): Vegetables {
  const filteredVegetables: Vegetables = {};

  for (const vegeName in vegetables) {
    const uniqueKeys = vegetables[vegeName];

    for (const uniqueKey in uniqueKeys) {
      const element = uniqueKeys[uniqueKey];

      // roadStationが「全て」の場合、一致しなくても追加
      if (element.farmer === farmerName && 
          (roadStation === "全て" || element.roadStation.includes(roadStation))) {
        if (!filteredVegetables[vegeName]) {
          filteredVegetables[vegeName] = {};
        }
        filteredVegetables[vegeName][uniqueKey] = element;
      }
    }
  }

  return filteredVegetables;
}

 

watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
});
function onPushBack(){
  router.back();
}
</script>
<template>
  <article class="road" v-if="Object.keys(filteredData).length==0">
    <div class="three-quarter-spinner"></div>
  </article >
    <article class="orderelement_card" v-if="Object.keys(filteredData).length!=0">
      <div class="title_order">
        <i class="bi bi-chevron-left" v-on:click="onPushBack"></i>
        <h2>出品内容の確認</h2>
    </div>
        <h2>{{name}}様</h2>
        <h3>購入物品</h3>
        <div v-for="(Data,vegeName,index) in filteredData" v-bind:key="index">
          <div v-for="(VegeData,unique) in Data" v-bind:key="unique">
            <article class="buyitem_card">
              <div class="img_name">
                <div class="cart_img">
                  <img :src="VegeData.photo" class="card-img-top" alt="..." v-if="VegeData.photo!='none'">
                  <img src="../../../assets/Noimage.jpeg" class="card-img-top" alt="..." v-if="VegeData.photo=='none'">
                </div>
                <div class="vegeinfo">
                  <p>【{{VegeData.farmer}}産】</p>
                  <h2>{{vegeName}}</h2>
                </div>
              </div>
              
              <p v-for="(Wholesaler,index) in VegeData.roadStation" v-bind:key="index" class="Wholesaler">
                【{{ Wholesaler }}】
              </p>
              <div class="select_money">
                <div class="selectnumber">
                </div>
                <div class="price">
                  <p class="unit">{{VegeData.unit}}</p>
                  <p class="money">￥{{VegeData.en}}</p>
                </div>
              </div>
              
            </article>
          </div>
          
        </div>
    </article>
</template>
<style scoped>
@keyframes spin {
  from {
    transform: rotate(0);
  }
  to{
    transform: rotate(359deg);
  }
}
.road{
width: 50px;
height: 50px;
margin: auto;}
.three-quarter-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #fb5b53;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin .5s linear 0s infinite;
}
p{
  margin: 0;
}
.title_order{
  display: flex;
  justify-content: flex-start;
}
.title_order i{
  font-size: 24px;
  padding: 0 5px;
}
.orderelement_card{
  width: 512px;
  background-color: white;
  margin: 0 auto;
  margin-top: 20px;
  border-radius: 5px;
}
.orderelement_card h2{
  margin: 20px;
}
.orderelement_card h3{
  margin: 20px;
}
.error{
  margin: 0 30px;
  color: red;
  font-size: 18px;
  font-weight: bold;
}
.orderelement_card button{
  background-color: var(--main-color);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 20px;
  margin: 0 100px;
  font-weight: bolder;
  border: none;
  margin-top: 10px;
}
.orderinfoelement{
  display: flex;
}
.orderinfoelement h5{
  font-size: 18px;
  width: 120px;
  font-weight: normal;
}
.orderinfo{
  border-radius: 10px;
  margin: 10px;
  padding: 10px;
  border: 1px solid var(--line-color);
}
.img_name{
  width: 100%;
  height: 65px;
  display: flex;
}
.cart_img{
  height: 65px;
  width: 140px;
}
.cart_img img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.buyitem_card{
  width: 512px;
  height: 135px;
  padding: 5px;
  background-color: white;
  margin: 0 auto;
  border-radius: 5px;
  border-top: 1px solid var(--line-color);
  border-bottom: 1px solid var(--line-color);
  }
  .Wholesaler {
    font-size: 14px!important;
    text-align: left;
    border-radius: 10px;
    display: inline-block;
    padding: 3px;
    text-align: center;
    border: 2px solid var(--main-color);
  }
  .vegeinfo p{
    font-size: 14px!important;
    text-align: left;
    border-radius: 10px;
    display: inline-block;
    padding: 3px;
    text-align: center;
    border: 2px solid var(--main-color);
  }
  .vegeinfo h2{
    font-size: 24px;
    border: none;
    margin: 0;
  }
  .select_money{
    display: flex;
    width: 100%;
    height: 30px;
  }
  .selectnumber{
    display: flex;
    width: 100px;
    height: 30px;
  }
  .backbutton{
    background-color: var(--line-color);
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border:none;
  }
  .plusbutton{
    background-color: var(--line-color);
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    border:none;
  }
  .Quantity{
    padding: 0 5px;
    border: 1px solid var(--line-color);
  }
  .price{
    display: flex;
    width: 150px;
    justify-content: space-around;
    font-size: 20px;
    color: var(--other-color);
    font-weight: bolder;
  }
  @media (max-width: 575.98px) { 
    .orderelement_card{
      width: 340px;
    }
    .buyitem_card{
      width: 300px;
    }
    .price{
      width: 100%;
    }
  }
</style>