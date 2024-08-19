<script setup lang="ts">
import { getDatabase, ref as fireRef, onValue } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import MyPageOrder from './components/mypage/MyPageOrder.vue'
import MyPageUpdate from './components/mypage/MyPageUpdate.vue'
import MyPageMyVege from './components/mypage/MyPageMyVege.vue'

onMounted(() => {
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
function readData(element: string) {
  const countRef = fireRef(getDatabase(), 'testVege/' + element)
  const data = ref<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}
const vegeAllData = ref<any>(readData(''))
const vegeKeys = computed(() => {
  return vegeAllData.value ? Object.keys(vegeAllData.value) : []
})
</script>

<template>
  <div class="title">
    <h1>マイページ</h1>
  </div>

  <my-page-update v-bind:current-user="currentUser" v-if="currentUser != null"></my-page-update>
  <my-page-my-vege
    v-bind:current-user="currentUser"
    v-bind:vegeAllData="vegeAllData"
    v-bind:vegeKeys="vegeKeys"
    v-if="currentUser != null && vegeAllData != undefined"
  ></my-page-my-vege>
  <my-page-order v-bind:current-user="currentUser" v-if="currentUser != null"></my-page-order>
</template>
<style>
.title {
  text-align: center;
}
</style>
