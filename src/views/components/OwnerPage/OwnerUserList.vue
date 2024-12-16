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
<h1>利用者リスト</h1>
<table>
    <caption>利用者の個人データ</caption>
    <thead>
      <tr>
        <th scope="col">名前</th>
        <th scope="col">性別</th>
        <th scope="col">uid</th>
        <th scope="col">電話番号</th>
        <th scope="col">email</th>
        <th scope="col">役職</th>
        <th scope="col">所属</th>
        <th scope="col">住所</th>
        <th scope="col">削除</th>
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
    <div class="card popup" style="width: 30rem" v-show="isPopup">
      <div class="card-body">
        <h5 class="card-title">確認</h5>
        <p>{{deleteData?.email}}を本当に削除しますか？</p>
        <button v-on:click="onPushYes" class="btn btn-primary">はい</button>
        <button v-on:click="isPopup=false" class="btn btn-primary">戻る</button>
      </div>
    </div>
</template>
<style scoped>

</style>