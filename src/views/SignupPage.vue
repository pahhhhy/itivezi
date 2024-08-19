<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  type User
} from 'firebase/auth'
import { ref, onMounted } from 'vue'

import email_form from './components/SignupForm.vue'
// ログインしているユーザーデータ
const currentUser = ref<User | null>(null)
const email = ref<string>('')
const password = ref<string>('')
const isPopup = ref<boolean>(false)
const errorMes = ref<string>('')
const name = ref<string>('')
const onInput = (inputEmail: string, inputPassword: string, inputName: string): void => {
  
  if (inputEmail != '') {
    email.value = inputEmail
  }
  if (inputPassword != '') {
    password.value = inputPassword
  }
  if (inputName != '') {
    name.value = inputName
  }
}
//確認メールの送信
function sendEmailVerifi(user: User) {
  sendEmailVerification(user)
    .then(() => {
      // Email verification sent!
      
    })
    
}

// サインアップ処理
function createAccount(email: string, password: string, name: string) {
  const auth = getAuth()
  if (email == '' || email == '') {
    return
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 成功時処理
      const user = userCredential.user
      
      isPopup.value = true
      sendEmailVerifi(user)
      return updateProfile(user, { displayName: name })
    })
    .then(() => {
      // プロファイル更新成功
      
    })

    .catch((error) => {
      // エラー処理
      
      const errorMessage = error.message
      
      setErrorMsg(errorMessage)
    })
}
function setErrorMsg(element: string) {
  switch (element) {
    case 'Firebase: Error (auth/invalid-email).':
      errorMes.value = '正しいメールアドレスをいれてください'
      break
    case ' Firebase: Password should be at least 6 characters (auth/weak-password).':
      errorMes.value = '6~20文字以内でパスワードを作ってください'
      break
    case 'Firebase: Error (auth/email-already-in-use).':
      errorMes.value = 'メールアドレスはもうつかわれています'
      break
    default:
      errorMes.value = ''
  }
}
onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.emailVerified) {
        // メール確認済み、ログイン許可
        
      } else {
        // メール未確認、ログイン不許可
        
      }
    } else {
      // ユーザーがサインアウトしている状態
    }
  })
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
    <h1>新規会員登録</h1>
  </div>
  <email_form v-on:OnInput="onInput"></email_form>
  <h1>{{ email }}</h1>
  <h1 v-if="currentUser != null">{{ currentUser.displayName }}様</h1>
  <h2 v-if="errorMes != ''" style="color: red">{{ errorMes }}</h2>
  <button type="button" class="btn btn-primary" @click="createAccount(email, password, name)">
    登録する
  </button>
  <section class="popup" v-show="isPopup">
    <h1>
      メールアドレスの確認メールをおくりました。<br />メールを確認してください<br />認証しないとログインできません
    </h1>
    <button><RouterLink v-bind:to="{ name: 'login' }">戻る</RouterLink></button>
  </section>
</template>
<style>
body {
  position: relative;
}
.title {
  text-align: center;
}
.popup {
  position: absolute;
  height: 30%;
  width: 50%;
  border: 1px gray solid;
  border-radius: 20px;
  text-align: center;
  background-color: white;
}
.link {
  text-decoration: none;
  color: black;
}
</style>
