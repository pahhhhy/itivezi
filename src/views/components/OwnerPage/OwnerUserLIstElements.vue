<script setup lang="ts">
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
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
interface Props {
  UserData:Usertables
  uid:string|number
}
interface Emits {
  (event: 'onPushDelete', data:deletedata): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
async function onPushDelete(){
  let deletedata:deletedata={email:props.UserData.email,uid:props.uid}
  emit("onPushDelete",deletedata)
}
</script>
<template>
<th>{{props.UserData.name}}</th>
<th>{{props.uid}}</th>
<th>{{props.UserData.phoneNumber}}</th>
<th> {{props.UserData.email}}</th>
<th>{{props.UserData.role}}</th>
<th>{{props.UserData.affiliation}}</th>
<th>{{props.UserData.place}}</th>
<th><button v-on:click="onPushDelete">削除</button></th>
</template>
<style scoped>

</style>