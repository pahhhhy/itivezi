<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User
} from 'firebase/auth'
import { ref, onMounted } from 'vue'

import rogin_form from './components/rogin_form.vue'
// ログインしているユーザーデータ
const currentUser = ref<User | null>(null)
const Email = ref<string>('')
const Password = ref<string>('')

// サインイン処理
function signin(email: string, password: string) {
  // メールアドレスとパスワードが入力されているかを確認
  if (email == '' || email == '') return
  const auth = getAuth()
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 成功時処理
      const user = userCredential.user
      console.log(user)
    })
    .catch((error) => {
      // 失敗時処理
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
    })
}
const OnInput = (email: string, password: string): void => {
  console.log('uketotta')
  if (email != '') {
    Email.value = email
  }
  if (password != '') {
    Password.value = password
  }
}
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null) {
      currentUser.value = user
    } else {
      currentUser.value = null
    }
  })
})
</script>
<template>
  <div class="title">
    <h1>ログイン</h1>
  </div>
  <rogin_form v-on:OnInput="OnInput"></rogin_form>
  <h1>{{ Email }}</h1>
  <h1 v-if="currentUser != null">{{ currentUser.displayName }}様</h1>
  <button type="button" class="btn btn-primary" @click="signin(Email, Password)">ログイン</button>
  <p>初めての方は</p>
  <h1><RouterLink v-bind:to="{ name: 'signup' }" class="link">新規会員登録</RouterLink></h1>
</template>
<style scoped>
.link {
  text-decoration: none;
  color: black;
}
</style>
