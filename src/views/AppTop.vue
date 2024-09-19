<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {
  getAuth,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import {RouterLink} from 'vue-router'
import { getDatabase, ref as fireRef, onValue} from 'firebase/database'
import AppTopBuyer from './components/AppTop/AppTopBuyer.vue';
import AppTopFarmer from './components/AppTop/AppTopFarmer.vue';
import AppTopOwner from './components/AppTop/AppTopOwner.vue';
enum Role{
  Onwer="管理者",
  Buyer="飲食店",
  Farmer="農家"
}
//読みこむデータの指定
async function readUserData(element: string): Promise<any> {
  const countRef = fireRef(getDatabase(), 'testUser/' + element)
  return new Promise((resolve, reject) => {
    onValue(
      countRef,
      (snapshot) => {
        resolve(snapshot.val())
      },
      (error) => {
        reject(error)
      }
    )
  })
}
const myUserData=ref<any>(null)
const currentUser = ref<User | null>(null)
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      initData()
    } else {
      currentUser.value = null
    }
  })
})
async function initData(){
  if(currentUser.value)
  myUserData.value=await readUserData(currentUser.value.uid)
  else{
    console.log("asdw")
  }
}
</script>

<template>
  <div class="title">
    <h1>TOP</h1>
  </div>
  <article v-if="currentUser == null">

    <div class="login-form">
      <h3>ログイン、会員登録することでこのアプリを使うことができます。</h3>
      <h2>ログインしてください。</h2>
      <p class="btn btn-success">
        <RouterLink v-bind:to="{ name: 'login' }">新規登録/ログイン</RouterLink>
      </p>
    </div>
    
    
  </article>
  <article v-if="currentUser != null">
    <h1>ようこそ{{ currentUser.displayName }}様</h1>
    <AppTopBuyer v-if="myUserData.role==Role.Buyer&&myUserData!=null"></AppTopBuyer>
    <AppTopFarmer v-if="myUserData.role==Role.Farmer&&myUserData!=null"></AppTopFarmer>
    <AppTopOwner v-if="myUserData.role==Role.Onwer"></AppTopOwner> 
  </article>
</template>
<style>
.title {
  text-align: center;
}
.login-form a{
  color: white;
  text-decoration: none;
}
.login-form{
  display: flex;
  align-items: center;
  flex-direction:column;
}
</style>
