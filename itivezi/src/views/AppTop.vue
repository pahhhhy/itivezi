<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User
} from 'firebase/auth'
import { RouterLink } from 'vue-router'
const currentUser = ref<User | null>(null)
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
</script>

<template>
  <div class="title">
    <h1>TOP</h1>
    <h1>github Actionsのテスト</h1>
  </div>
  <article v-if="currentUser == null">
    <h2>ログインしてください。</h2>
    <p>
      <RouterLink v-bind:to="{ name: 'rogin' }">新規登録/ログイン</RouterLink>
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
