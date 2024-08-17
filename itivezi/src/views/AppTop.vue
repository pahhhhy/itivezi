<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdTokenResult,
  type User
} from 'firebase/auth'
import { RouterLink } from 'vue-router'
const currentUser = ref<User | null>(null)
const UserData = ref()
onMounted(async () => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      try {
        UserData.value = await getIdTokenResult(user, true) // 最新のIDトークンを強制的にリフレッシュ
        console.log(UserData.value.claims.role) // カスタムクレームをログに出力
      } catch (error) {
        console.error(error)
      }
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
      <RouterLink v-bind:to="{ name: 'rogin' }">新規登録/ログイン</RouterLink>
    </p>
  </article>
  <article v-if="currentUser != null">
    <h1>ようこそ{{ currentUser.displayName }}様</h1>
    <h3>役職: {{ UserData.role }}</h3>
    <h3>性別: {{ UserData.gender }}</h3>
    <h3>電話番号: {{ UserData.PhoneNumber }}</h3>
  </article>
</template>
<style>
.title {
  text-align: center;
}
</style>
