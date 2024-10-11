<script setup lang="ts">
import { ref,watch} from 'vue'
import { usefireUserStore } from '@/stores/fireUserdata';
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
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
interface Props {
  UserData:Usertables
  uid:string|number
}
const props = defineProps<Props>()
const fireUserStore=usefireUserStore()
// async function deleteAcount(){
//   await fireUserStore.delete(props.uid)
// }
</script>
<template>
<th>{{props.UserData.name}}</th>
<th>{{props.UserData.gender}}</th>
<th>{{props.uid}}</th>
<th>{{props.UserData.phoneNumber}}</th>
<th> {{props.UserData.email}}</th>
<th>{{props.UserData.role}}</th>
<th>{{props.UserData.affiliation}}</th>
<th>{{props.UserData.place}}</th>
<!-- <th><button v-on:click="deleteAcount">削除</button></th> -->
</template>
<style scoped>

</style>