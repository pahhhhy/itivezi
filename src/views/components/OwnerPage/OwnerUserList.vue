<script setup lang="ts">
import { ref} from 'vue'
import { usefireUserStore } from '@/stores/fireUserdata';
import { useDeleteUidStore } from '@/stores/deleteUidList';
import OwnerUserLIstElements from './OwnerUserLIstElements.vue';
interface AllUserTables{
    [uid:string]:Usertables
}
interface deletedata{
    uid:string|number,
    email:string
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
  const fireUseStore=usefireUserStore()
const AllUserData=ref<AllUserTables>()
const deleteData=ref<deletedata>()
const deleteUidStore=useDeleteUidStore()
const isPopup=ref<boolean>(false)
async function initData() {
    AllUserData.value=await fireUseStore.AllroadFireUseData()
    
}
initData()
function onPushDelete(deletedata:deletedata){
  deleteData.value=deletedata
  isPopup.value=true
}
async function onPushYes(){
  if(deleteData.value!=undefined){
    await fireUseStore.delete(deleteData.value.uid)
  AllUserData.value=await fireUseStore.AllroadFireUseData()
  await deleteUidStore.update(deleteData.value).then(() => {
  console.log("Update successful");
}).catch(error => {
  console.error("Error updating:", error);
});
  isPopup.value=false
  }
  
}
</script>
<template>
  <article class="UserList-card">
    <h1>利用者リスト</h1>
    <article class="table-area">
      <table>
        <caption>利用者の個人データ</caption>
        <thead>
          <tr>
            <th scope="col" class="name">名前</th>
            <th scope="col" class="role">役職</th>
            <th scope="col" class="phone">電話番号</th>
            <th scope="col" class="email">email</th>
            <th scope="col" class="aff">所属</th>
            <th scope="col" class="place">住所</th>
            <th scope="col" class="uid">uid</th>
            <th scope="col" class="delete">削除</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(UserData,uid) in AllUserData" :key="uid">
            <OwnerUserLIstElements
            v-bind:-user-data="UserData"
            v-bind:uid="uid"
            v-on:on-push-delete="onPushDelete"></OwnerUserLIstElements>
          </tr>
        </tbody>
      </table>
    </article>
    
        <div class="card popup" style="width: 30rem" v-show="isPopup">
          <div class="card-body">
            <h5 class="card-title">確認</h5>
            <p>{{deleteData?.email}}を本当に削除しますか？</p>
            <button v-on:click="onPushYes" class="btn btn-primary">はい</button>
            <button v-on:click="isPopup=false" class="btn btn-primary">戻る</button>
          </div>
        </div>
  </article>

</template>
<style scoped>
.UserList-card{
  width: 512px;
  height: 600px;
  margin: 0 auto;
  border: 10px;
  background-color: white;
  margin-top: 20px;
  padding: 20px;
}
.UserList-card h1{
  border-bottom: 1px solid black;
  padding-bottom: 2px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 16px;
  text-align: left;
  table-layout: fixed; /* 各列の幅を固定 */
}
.table-area{
  width: 100%;
  overflow: scroll;
}
.table-area::-webkit-scrollbar {
  width:0px;
}
.table-area::-webkit-scrollbar-thumb {
  background: var(--line-color);
  width: 6px;
  height: 1px;
  border-radius: 5px;
}
th, td {
  border: 1px solid #ddd;
  text-align: center;
  overflow: hidden;
}
/* 各列の幅調整 */
th.name, td.name {
  width: 120px;
  height: 30px!important;
}

th.role, td.role {
  width: 50px; 
}

th.phone, td.phone {
  width: 100px; }

th.email, td.email {
  width: 200px; 
}

th.aff, td.aff {
  width: 150px; 
}

th.place, td.place {
  width: 350px; 
}

th.uid, td.uid {
  width: 300px; 
}

th.delete, td.delete {
  width: 50px; 
  text-align: center;
}

/* ホバーエフェクト */
tbody tr:hover {
  background-color: #f1f1f1;
}
th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f1f1f1;
}

thead th {
  border-bottom: 2px solid #ddd;
}

.caption {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  z-index: 1000;
}

.btn {
  margin: 10px 5px;
}
@media (max-width: 575.98px) { 
  .UserList-card{
      width: 340px;
      padding: 10px;
  }
}
</style>