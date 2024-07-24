<script setup lang="ts">
import { getDatabase, ref as Fireref, onValue } from 'firebase/database'
//Vueとfirebaseで同じrefという関数があって競合しているのでVueの方をVuerefにしている
import { ref as Vueref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import mypage_order from './components/mypage/mypage_order.vue'
import mypage_update from './components/mypage/mypage_update.vue'
import mypage_myvege from './components/mypage/mypage_myvege.vue'

onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      console.log('読み込みました')
    } else {
      currentUser.value = null
    }
  })
})
const currentUser = Vueref<User | null>(null)
const comkey = Vueref<number>(0)
function ReadData(element: string) {
  const CountRef = Fireref(getDatabase(), 'testVege/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}
const vegeAllData = Vueref<any>(ReadData(''))
const vegekeys = computed(() => {
  return vegeAllData.value ? Object.keys(vegeAllData.value) : []
})
// データを再読み込みする関数
function reloadData() {
  vegeAllData.value = ReadData('')
  comkey.value += 1
  console.log('更新されたはず')
}
</script>

<template>
  <div class="title">
    <h1>マイページ</h1>
  </div>

  <mypage_order v-bind:current-user="currentUser" v-if="currentUser != null"></mypage_order>
  <mypage_update v-bind:current-user="currentUser" v-if="currentUser != null"></mypage_update>
  <mypage_myvege
    v-bind:current-user="currentUser"
    v-bind:vegealldata="vegeAllData"
    v-bind:vegekeys="vegekeys"
    v-on:reload-data="reloadData"
    v-bind:key="comkey"
    v-if="currentUser != null && vegeAllData != null"
  ></mypage_myvege>
</template>
<style>
.title {
  text-align: center;
}
</style>
