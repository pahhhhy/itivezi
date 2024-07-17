<script setup lang="ts">
import { RouterLink } from 'vue-router'
import router from '../router'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  type User
} from 'firebase/auth'
import { getDatabase, ref as Fireref, child, get, onValue, set, remove } from 'firebase/database'
import { ref as Vueref, onMounted } from 'vue'
import rogin_form from './components/rogin_form.vue'
// ログインしているユーザーデータ
const currentUser = Vueref<User | null>()
const Email = Vueref<string>('')
const Password = Vueref<string>('')
const errorMes = Vueref<string>('')
const UserData = Vueref<any>(ReadUserData(''))

// 読み込むデータの指定
function ReadUserData(element: string) {
  const CountRef = Fireref(getDatabase(), 'testUser/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}
// サインイン処理
function signin(email: string, password: string) {
  // メールアドレスとパスワードが入力されているかを確認
  if (email == '' || email == '') return
  const auth = getAuth()
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 成功時処理
      const user = userCredential.user
      if (user.emailVerified) {
        // メールアドレスが認証済みの場合の処理
        console.log('User signed in:', user)
        errorMes.value = ''
        if (currentUser.value != null) {
          let CUserData: User = currentUser.value
          if (UserData.value[CUserData.uid] == null) {
            router.push('/Add_Info')
          }
        } else {
          console.log('currentUserがnull')
          router.push('/')
        }
      } else {
        // メールアドレスが未認証の場合の処理
        console.log('Email not verified')
        sendEmailVerification(user)
        errorMes.value =
          'メールアドレス認証ができていません。もう一度送るのでメールを確認してください'
        signOut(auth)
          .then(() => {
            console.log('User signed out')
            // 必要に応じて未認証のユーザーに通知する処理を追加
          })
          .catch((error) => {
            console.error('Sign out error:', error)
          })
      }
    })
    .catch((error) => {
      // 失敗時処理
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
      errorMes.value = 'パスワードかメールアドレスが間違っています'
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
    if (user != null && user.emailVerified) {
      currentUser.value = user
      console.log('読み込みました')
    } else {
      currentUser.value = null
    }
  })
})
console.log(UserData.value)
</script>
<template>
  <div class="title">
    <h1>ログイン</h1>
    <h2></h2>
  </div>
  <rogin_form v-on:OnInput="OnInput"></rogin_form>
  <h1>{{ Email }}</h1>
  <h1 v-if="currentUser != null">{{ currentUser.displayName }}様</h1>
  <h2 v-if="errorMes != ''" style="color: red">{{ errorMes }}</h2>
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
