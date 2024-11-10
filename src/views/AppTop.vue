<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {
  getAuth,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import {RouterLink} from 'vue-router'

const currentUser = ref<User | null>(null)
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
</script>

<template>
  <div class="title">
    <h1>TOP</h1>
  </div>
  <article v-if="currentUser == null">
    <h2>ログインしてください。</h2>
    <p>
      <RouterLink v-bind:to="{ name: 'login' }">新規登録/ログイン</RouterLink>
    </p>
  </article>
  <article v-if="currentUser != null">
    <h1>ようこそ{{ currentUser.displayName }}様</h1>
    <router-link to="/announcements">掲示板</router-link>
    <router-link to="/chat">チャット</router-link>
  </article>
</template>
<style>
.title {
  text-align: center;
}
</style>
