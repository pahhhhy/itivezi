<script setup lang="ts">
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  type User
} from 'firebase/auth'
import { ref, onMounted } from 'vue'
import '../assets/main.css'
import email_form from './components/SignupForm.vue'
import router from '../router'
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
function OnPushBack(){
  router.push('/login')
  window.scrollTo({
    top: 0,       // 一番上に移動
  });
}
</script>

<template>
  <article class="signup_page">
    <div class="title">
      <h1>アカウントの新規作成</h1>
    </div>
    <article class="form_card">
      <email_form v-on:OnInput="onInput"></email_form>
      <h1 v-if="currentUser != null">{{ currentUser.displayName }}様</h1>
      <h2 v-if="errorMes != ''" style="color: red">{{ errorMes }}</h2>
      <div class="d-flex justify-content-center my-3 ">
        <button type="button" class="btn btn-success form_button" @click="createAccount(email, password, name)">
          登録する
        </button>
      </div>
      
      
    </article>
    <section class="popup_signup" v-show="isPopup">
      <h2>
        メールアドレスの確認メールをおくりました。<br />メールを確認してください<br />認証しないとログインできません
      </h2>
      <button class="btn btn-success form_button " v-on:click="OnPushBack"> 戻る</button>
    </section>
  </article>
  
</template>
<style scoped>
:root {
  --main-color: #8CD790;
  --sub-color:#C5E99B;
  --text-color:#434343;
  --acsent-color:#C5E99B;
  --background-color:#F1F1F1;
  --other-color:#008037;
}
body {
  position: relative;
}

.signup_page{
  width: 536px!important;
  margin: auto;
}
.form_card{
  background-color: white;
  border-radius: 20px;
  margin: auto;
  padding: 48px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 10px;
}
.title {
  display: flex;
  align-items: center;
  padding: 30px 0;
  color: var(--text-color)!important;
}
.popup_signup {
  position: absolute;
  top: 40%;
  left: 25%;
  width: 50%;
  border-radius: 20px;
  text-align: center;
  background-color: white;
  box-shadow: rgba(60, 69, 50, 0.2) 0px 6px 20px;
  padding: 1.5rem;
}
.popup_signup >button{
  margin-top: 30px;
}
.link {
  text-decoration: none;
  color: white;
}
.form_button{
  width: 100%;
  padding: 0.625rem;
  height: 48px;
  line-height: 1.25;
  font-weight: 500;
  max-width: 240px;
  box-shadow: rgba(60, 69, 50, 0.2) 0px 6px 20px;
  transition-property: background-color, color, box-shadow;
    transition-duration: 150ms;
    transition-timing-function: ease-in-out;
}
</style>
