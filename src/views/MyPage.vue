<script setup lang="ts">
import { getDatabase, ref as fireRef, onValue } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref,  onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import MyPageOrder from './components/mypage/MyPageOrder.vue'
import MyPageUpdate from './components/mypage/MyPageUpdate.vue'
import MyPageMyVege from './components/mypage/MyPageMyVege.vue'

onMounted(() => {
  initData()
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      
    } else {
      currentUser.value = null
    }
  })
})
const currentUser = ref<User | null>(null)
function readvegeAllData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testVege/' )
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}
async function initData(){
  vegeAllData.value=await readvegeAllData()
  
}
const vegeAllData = ref<any>(null)


</script>

<template>
  <div class="title">
    <h1>マイページ</h1>
  </div>

  <my-page-update v-bind:current-user="currentUser" v-bind:vege-all-data="vegeAllData" v-if="currentUser != null"></my-page-update>
  <my-page-my-vege
    v-bind:current-user="currentUser"
    v-bind:vege-all-data="vegeAllData"
    v-on:init-data="initData"
    v-if="currentUser != null && (vegeAllData != null && vegeAllData.length !== 0)"
  ></my-page-my-vege>
  <my-page-order v-bind:current-user="currentUser" v-if="currentUser != null"></my-page-order>
</template>
<style>
.title {
  text-align: center;
}
</style>
