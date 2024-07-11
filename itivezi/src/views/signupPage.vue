<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  type User
} from 'firebase/auth'
import { ref, onMounted } from 'vue'

import email_form from './components/signup_form.vue'
// ログインしているユーザーデータ
const currentUser = ref<User | null>(null)
const Email = ref<string>('')
const Password = ref<string>('')
const Ispopup = ref<boolean>(false)
const errorMes = ref<string>('')
const Name = ref<string>('')
const OnInput = (email: string, password: string, name: string): void => {
  console.log('uketotta')
  if (email != '') {
    Email.value = email
  }
  if (password != '') {
    Password.value = password
  }
  if (name != '') {
    Name.value = name
  }
}
//確認メールの送信
function sendEmailVerifi(User: User) {
  sendEmailVerification(User)
    .then(() => {
      // Email verification sent!
      console.log('確認メールをおくりました')
    })
    .catch((error) => {
      // 失敗時処理
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
    })
}

// サインアップ処理
function createAccount(email: string, password: string, name: string) {
  const auth = getAuth()
  if (email == '' || email == '') {
    console.log('何もない何もない私何もない')
    return
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 成功時処理
      const user = userCredential.user
      console.log(user)
      Ispopup.value = true
      sendEmailVerifi(user)
      return updateProfile(user, { displayName: name })
    })
    .then(() => {
      // プロファイル更新成功
      console.log('User profile updated with name')
    })

    .catch((error) => {
      // エラー処理
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode + '  :  ' + errorMessage)
      ErrorMes(errorMessage)
    })
}
function ErrorMes(element: string) {
  switch (element) {
    case 'Firebase: Error (auth/invalid-email).':
      errorMes.value = '正しいメールアドレスをいれてください'
      break
    case ' Firebase: Password should be at least 6 characters (auth/weak-password).':
      errorMes.value = '6～20文字以内でパスワードを作ってください'
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
        console.log('Email verified, login allowed')
      } else {
        // メール未確認、ログイン不許可
        console.log('Email not verified, login not allowed')
      }
    } else {
      // ユーザーがサインアウトしている状態
    }
  })
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
    <h1>新規会員登録</h1>
  </div>
  <email_form v-on:OnInput="OnInput"></email_form>
  <h1>{{ Email }}</h1>
  <h1 v-if="currentUser != null">{{ currentUser.displayName }}様</h1>
  <h2 v-if="errorMes != ''" style="color: red">{{ errorMes }}</h2>
  <button type="button" class="btn btn-primary" @click="createAccount(Email, Password, Name)">
    登録する
  </button>
  <section class="popup" v-show="Ispopup">
    <h1>メールアドレスの確認メールをおくりました。<br />メールを確認してください</h1>
    <button><RouterLink v-bind:to="{ name: 'rogin' }">戻る</RouterLink></button>
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
