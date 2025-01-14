<script setup lang="ts">
import {useRoadStationStore} from "../../../stores/roadStation"
import {ref,watch} from 'vue'
import { usefireUserStore } from '@/stores/fireUserdata';
import { useFireOrderStore } from '@/stores/fireOrder';
interface AllUserTables{
  [uid:string]:Usertables
}
interface Usertables{
    affiliation:String[]
   
    name:string
    phoneNumber:number
    place:string
    role:Role
    email:string
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
  }

enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
enum OrderStete{
  Completed="取引完了",
  Uncontacted="未連絡",
  contacted="連絡済み",
  cancel="取引取り消し"
}
interface Ordertables{
    [uid:string]:{
        [uniqueKey:string]:OrdertablesElement
    }
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
  state:OrderStete
  totalMoney:number
place:string
}

const fireOrderStore=useFireOrderStore()
const orderAllData = ref<Ordertables>(fireOrderStore.OrderAllData)
const fireUseStore=usefireUserStore()
const userAllData=ref<AllUserTables>({})
const filterAllUserData=ref<AllUserTables>({})
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
  roadStationUnitTempList.value.unshift("全て");
const selectedRoadStation = ref<string>(roadStationUnitTempList.value[0])
const totalUser = ref<number>(0)
const fliterOrderData=ref<Ordertables>(orderAllData.value)
const totalFarmer = ref<number>(0)
const totalMoney = ref<number>(0)
const totalOrderNum = ref<number>(0)
const totalOrderHuman = ref<number>(0)
watch(() => fireOrderStore.OrderAllData, (newUser) => {
  orderAllData.value = newUser;
  initData()
}); 

const countNumInOrderTables = (orderTables: Ordertables): number => {
  let numCount = 0;
  if (!orderTables) {
    console.error("カウントないっす")
    return 0;
    
  }
  // orderTablesの各ユーザーをループ
  Object.values(orderTables).forEach(uniqueEntries => {
    // 各uniqueKeyのOrdertablesElementをループ
    Object.values(uniqueEntries).forEach(orderElement => {
      // 各OrdertablesElement内のnumの数をカウント
      numCount += Object.keys(orderElement).filter(key => !isNaN(Number(key))).length;
    });
  });

  return numCount;
};

function countFarmers  (allUserTables: AllUserTables): number  {
  let farmerCount = 0;

  Object.values(allUserTables).forEach(user => {
    if (user.role === "農家") {
      farmerCount++;
    }
  });

  return farmerCount;
};
function filterRoadStationByRoomne(orderTables: Ordertables, roadStation: string): Ordertables {
  // Create a deep copy of orderTables
  const filteredOrderTables: Ordertables = JSON.parse(JSON.stringify(orderTables));
  // Loop through each user's uid
  Object.entries(filteredOrderTables).forEach(([uid, uniqueEntries]) => {
    // Loop through each uniqueKey
    Object.entries(uniqueEntries).forEach(([uniqueKey, orderElement]) => {
      let fliterKey = Object.keys(orderElement);
      let fliternum = fliterKey.length - 6;

      for (let i: number = 0; i < fliternum; i++) {
        if (!orderElement[Number(fliterKey[i])].roadStation.includes(roadStation)) {
          delete filteredOrderTables[uid][uniqueKey][Number(fliterKey[i])];
        }
      }

      let afterfliterKey = Object.keys(filteredOrderTables[uid][uniqueKey]);
      let afterfilternum = afterfliterKey.length - 6;

      if (afterfilternum == 0) {
        delete filteredOrderTables[uid][uniqueKey];
      }
    });
  });

  return filteredOrderTables;
}
async function initData() {
  userAllData.value=await fireUseStore.AllroadFireUseData()
  //道の駅ごとにフィルターをやって
  if(selectedRoadStation.value=="全て"){
    filterAllUserData.value=userAllData.value
    fliterOrderData.value=orderAllData.value
  }else{
    filterAllUserData.value= filterByAffiliation(userAllData.value,selectedRoadStation.value)
    fliterOrderData.value=filterRoadStationByRoomne(orderAllData.value,selectedRoadStation.value)
  }
  let userUids = Object.keys(filterAllUserData.value)
  totalUser.value = userUids.length
  totalOrderNum.value = countNumInOrderTables(fliterOrderData.value)
  totalFarmer.value = countFarmers(filterAllUserData.value)
  totalMoney.value = getTotalMoney(fliterOrderData.value)
}

initData()
//ALLUserTalbeから道の駅ごとにフィルターをする
const filterByAffiliation = (userTables: AllUserTables,roadStation:string): AllUserTables => {
  const filtered: AllUserTables = {};

  Object.entries(userTables).forEach(([uid, userData]) => {
    if (userData.affiliation.includes(roadStation)) {
      filtered[uid] = userData;
    }
  });

  return filtered;
};
//取引完了のものの総額を計算する
function getTotalMoney(data: Ordertables) {
  let totalCompletedMoney = 0;
  let countConplateOrder=0
  for (const orderId in data) {
    const orderDetails = data[orderId];
    for (const orderDate in orderDetails) {
      const order = orderDetails[orderDate];
      if (order.state === OrderStete.Completed) {
        totalCompletedMoney += order.totalMoney;
        countConplateOrder += 1
      }
    }
  }
  totalOrderHuman.value=countConplateOrder
  return totalCompletedMoney
}
</script>
<template>
  <!-- {{ orderAllData }} -->
    <!-- {{ fliterOrderData }} -->
  <h1>各種データ</h1>
  <select class="form-select" aria-label="roadsideStationSelect" v-model="selectedRoadStation" @change="initData">
    <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation>
      {{ roadStation }}
    </option>
  </select>
  <!-- {{ orderAllData }} -->
  <!-- <p>{{userAllData}}</p> -->
  <h2>利用数：{{ totalUser }}</h2>
  <h2>注文数:{{ totalOrderNum }}</h2>
  <h2>農家数:{{ totalFarmer }}</h2>
  <h2>合計金額:{{ totalMoney }}円</h2>
  <h2>購入者数:{{ totalOrderHuman }}</h2>
  <p>※合計金額は取引完了したものの総額です。</p>
</template>
<style></style>