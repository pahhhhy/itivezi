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
    <h1>github Actionsのテスト</h1>
  </div>
  <article v-if="currentUser == null">
    <h2>ログインしてください。</h2>
    <p>
      <RouterLink v-bind:to="{ name: 'login' }">新規登録/ログイン</RouterLink>
    </p>
  </article>
  <article v-if="currentUser != null">
    <h1>ようこそ{{ currentUser.displayName }}様</h1>
  </article>
</template>
<style>
.title {
  text-align: center;
}
</style>
