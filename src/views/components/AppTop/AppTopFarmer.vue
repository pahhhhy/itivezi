<script setup lang="ts">
import { RouterLink } from 'vue-router'
import router from '@/router'
import {
  getAuth,
  signOut,
} from 'firebase/auth'
import {useIconStore}from "@/stores/icon"
const iconStore = (useIconStore())
const auth = getAuth()
function logout() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      iconStore.deleteURL()
      router.push("/")
    })
}
</script>
<template>
<h1>農家</h1>
<div class="row">
    <div class="col-sm-6 mb-3 mb-sm-0">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title"><i class="bi bi-cart"></i>注文</h5>
          <p class="card-text">野菜の注文ができます</p>
          <div  class="btn btn-primary"><RouterLink v-bind:to="{ name: 'order' }" class="link">注文</RouterLink></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6 mb-3 mb-sm-0">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-cart"></i>登録</h5>
            <p class="card-text">自分が作った野菜を登録することで販売することができます。</p>
            <div  class="btn btn-primary"><RouterLink v-bind:to="{ name: 'registration' }" class="link">登録</RouterLink></div>
          </div>
        </div>
      </div>
    <div class="col-sm-6">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title"><i class="bi bi-person"></i>マイページ</h5>
          <p class="card-text">自分の情報の更新や過去の注文を確認することができます。</p>
          <div  class="btn btn-primary"><RouterLink v-bind:to="{ name: 'my-page' }" class="link">マイページ</RouterLink></div>
        </div>
      </div>
    </div>
    <div class="col-sm-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-box-arrow-in-left"></i>ログアウト</h5>
            <a  class="btn btn-primary"><p @click="logout" class="link">ログアウト</p></a>
          </div>
        </div>
      </div>
  </div>
</template>
<style scoped>
.link{
    text-decoration: none;
    color: white;
}
p{
    margin: 0;
}
</style>