<script setup lang="ts">
import { ref,watch} from 'vue'
import { usefireUserStore } from '@/stores/fireUserdata';
import OwnerUserLIstElements from './OwnerUserLIstElements.vue';
interface AllUserTables{
    [uid:string]:Usertables
}
interface Usertables{
    affiliation:String[]
    gender:string
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
async function initData() {
    AllUserData.value=await fireUseStore.AllroadFireUseData()
}
initData()
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
        <!-- <th scope="col">削除</th> -->
      </tr>
    </thead>
    <tbody>
      <tr v-for="(UserData,uid) in AllUserData" :key="uid">
        <OwnerUserLIstElements
        v-bind:-user-data="UserData"
        v-bind:uid="uid"></OwnerUserLIstElements>
      </tr>
    </tbody>
  </table>
</template>
<style scoped>

</style>