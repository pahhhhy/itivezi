<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { ref,onMounted} from 'vue'
import gsap from 'gsap';
import { useUserStore } from './stores/userData';
import { usefireUserStore } from './stores/fireUserdata';
const isBurger=ref<boolean>()
const background=ref(null)
const userStore=useUserStore()
const fireUseStore=usefireUserStore()
const currentUser = ref(userStore.currentUser);
function OnBurger(bool:boolean){
  if(!isBurger.value){
    gsap.fromTo(background.value,0.5,{backgroundColor:"#f8f8f800"},{backgroundColor:"#00000020"})
  }else{
    gsap.fromTo(background.value,0.5,{backgroundColor:"#00000020"},{backgroundColor:"#f8f8f800"})
  }
  isBurger.value=bool;
}
async function initData(){
  await userStore.roadUserData()
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
  <AppHeader v-on:-on-burger="OnBurger"></AppHeader>
  <div v-bind:class="{black_back:isBurger}" class="background" ref="background">
    <RouterView />
  </div>
  
</template>

<style scoped>
* {
  width: 100%;
  height: 100%;
  
}
body{
  overflow-x:hidden;
}
.background{
  background-color:#f8f8f8 ;
  width: 100%;
  height: 100vh;
  z-index: -1;
}
.black_back{
  width: 100%;
  height: 100vh;
  z-index: -1;
}
</style>
