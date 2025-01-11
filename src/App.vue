<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { ref,onMounted} from 'vue'
import gsap from 'gsap';
import { useUserStore } from './stores/userData';
import { usefireUserStore } from './stores/fireUserdata';
import { useVegeStore } from './stores/vege';
import { useCartStore } from '@/stores/cart';
import { useFireOrderStore } from './stores/fireOrder';
import { useSortVegeStore } from './stores/sortByVege';
import ChatRoomDataWrapper from "@/views/components/chatPage/ChatRoomDataService.vue";
enum SortMode{
    All="all",
    Kawasaki="川崎",
    Murone="室根",
    Other="その他"
}

const userStore=useUserStore()
const vegeStore=useVegeStore()
const sortVegeStore=useSortVegeStore()
const FireOrderStore=useFireOrderStore()
const fireUseStore=usefireUserStore()
const currentUser = ref(userStore.currentUser);
const CartStore=useCartStore()

async function initData(){
  await userStore.roadUserData()
  await vegeStore.roadData()
  await FireOrderStore.roadData()
  await sortVegeStore.roadData(SortMode.All)
  CartStore.roadData()
  currentUser.value=userStore.currentUser
  if(currentUser.value){
    await fireUseStore.roadFireUseData(currentUser.value.uid)
  }
  
else
console.log("error")
}
onMounted(() => {
  initData()
})
</script>

<template>
  <AppHeader></AppHeader>
  <RouterView />
  <ChatRoomDataWrapper v-if="currentUser" :user="currentUser" />
  
  
</template>

<style scoped>
* {
  width: 100%;
  height: 100%;
  
}
body{
  overflow-x:hidden;
}


</style>
