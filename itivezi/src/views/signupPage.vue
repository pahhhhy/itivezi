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
  reload,
  type User
} from 'firebase/auth'
import { ref, onMounted } from 'vue'

import email_form from './components/signup_form.vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import router from '../router'
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

const auth = getAuth()
const isEmailVerified = ref<boolean>(false)
// メール認証状態を確認する関数
const checkEmailVerification = async (user: User) => {
  await reload(user) // ユーザー情報を再取得
  if (user.emailVerified) {
    console.log('メールアドレスが認証されました')
    isEmailVerified.value = true
    handleEmailVerified(user)
  } else {
    console.log('メールアドレスはまだ認証されていません')
    isEmailVerified.value = false
  }
}
const IsFisish = ref<boolean>(false)
// メール認証完了時に呼び出される関数
const handleEmailVerified = (user: User) => {
  console.log('メール認証完了時の処理を実行')
  // ここにメール認証完了時の処理を記述
  signin(Email.value, Password.value)
}

// 認証状態の変更を監視する関数
const watchAuthState = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user
      // 定期的にメール認証状態をチェック
      const intervalId = setInterval(() => {
        checkEmailVerification(user)
        if (user.emailVerified) {
          clearInterval(intervalId) // メール認証完了後はチェックを停止
        }
      }, 1000) // 5秒ごとにチェック（適宜調整してください）
    } else {
      currentUser.value = null
      isEmailVerified.value = false
    }
  })
}

// コンポーネントのsetup関数内やonMounted内で呼び出す
watchAuthState()
// サインイン処理
function signin(email: string, password: string) {
  // メールアドレスとパスワードが入力されているかを確認
  if (email == '' || email == '') return
  const auth = getAuth()
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 成功時処理
      const user = userCredential.user
      //ポップアップが出た時にWEBを閉じられる可能性があるからログインの時にもメールの確認が必要
      if (user.emailVerified) {
        // メールアドレスが認証済みの場合の処理
        console.log('User signed in:', user)
        errorMes.value = ''
        router.push('/Add_Info')
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
  <section class="popup" v-show="Ispopup && !IsFisish">
    <h1>まだ終わってません！</h1>
    <h2>
      メールアドレスの確認メールをおくりました。<br />メールを確認してください<br />認証しないとログインできません
    </h2>
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
