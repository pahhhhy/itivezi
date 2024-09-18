<script setup lang="ts">
import { RouterLink } from 'vue-router'
import router from '../router'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendEmailVerification,
  type User
} from 'firebase/auth'
import { getDatabase, ref as fireRef, onValue} from 'firebase/database'
import { ref, onMounted } from 'vue'
import LoginForm from './components/LoginForm.vue'
import { getStorage, ref as storageRef, getMetadata } from 'firebase/storage';
import '../assets/main.css'
// ログインしているユーザーデータ
const currentUser = ref<User | null>()
const email = ref<string>('')
const password = ref<string>('')
const errorMes = ref<string>('')
const userData = ref<any>(readUserData(''))

// 読み込むデータの指定
function readUserData(element: string) {
  const countRef = fireRef(getDatabase(), 'testUser/' + element)
  const data = ref<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}
async function checkMyData() {
  let isOk = true
 
  if (currentUser.value != null) {
    console.log(currentUser.value.photoURL)
    if (userData.value[currentUser.value.uid] == null) {
      isOk = false
    } else {
      if (userData.value[currentUser.value.uid].gender == null) {
        isOk = false
      }
      if (
        userData.value[currentUser.value.uid].place == null ||
        userData.value[currentUser.value.uid].place == ''
      ) {
        isOk = false
      }
      if (userData.value[currentUser.value.uid].role == null) {
        isOk = false
      }
      if (
        userData.value[currentUser.value.uid].phoneNumber == null ||
        userData.value[currentUser.value.uid].phoneNumber == 0||
        userData.value[currentUser.value.uid].affiliation == null||
        userData.value[currentUser.value.uid].affiliation == ""
      ) {
        isOk = false
      }
      if (
        currentUser.value.photoURL==null||
        currentUser.value.photoURL==undefined||
        currentUser.value.photoURL==''
      ) {
        isOk = false
      }
      if(currentUser.value.photoURL){
        if(await checkImageExistsInFirebase( currentUser.value.photoURL)==false){
        isOk = false
        console.log(isOk)
      }
      }
      
    }
  }
  return isOk
}
// サインイン処理
async function signin(email: string, password: string) {
  // メールアドレスとパスワードが入力されているかを確認
  if (email == '' || email == '') return
  const auth = getAuth()
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // 成功時処理
      const user = userCredential.user
      if (user.emailVerified) {
        // メールアドレスが認証済みの場合の処理
        
        errorMes.value = ''
        if (currentUser.value != null) {
          if (!await checkMyData()) {

            router.push('/add-info')
          } else {
            window.scrollTo({
              top: 0,       // 一番上に移動
            });
            router.push('/')
          }
        } else {
          router.push('/add-info')
        }
      } else {
        // メールアドレスが未認証の場合の処理
        
        sendEmailVerification(user)
        errorMes.value =
          'メールアドレス認証ができていません。もう一度送るのでメールを確認してください'
        signOut(auth)
          .then(() => {
            
            // 必要に応じて未認証のユーザーに通知する処理を追加
          })
      }
    })
    .catch(() => {
      // 失敗時処理
      errorMes.value = 'パスワードかメールアドレスが間違っています'
    })
}

const onInput = (inputEmail: string, inputPassword: string): void => {
  
  if (inputEmail != '') {
    email.value = inputEmail
  }
  if (inputPassword != '') {
    password.value = inputPassword
  }
}
async function checkImageExistsInFirebase(path: string): Promise<boolean> {
  const storage = getStorage();
  const imageRef = storageRef(storage, path);

  try {
    await getMetadata(imageRef);
    return true;  // メタデータが取得できた場合は存在する
  } catch (error) {
    if ((error as any).code === 'storage/object-not-found') {
      return false;  // 画像が見つからない場合
    }
    console.error('画像存在確認エラー:', error);
    return false;
  }
}
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
  <article class="login_page">
    <div class="title">
      <h1>ログイン</h1>
    </div>
    <article class="form_card">
      <login-form v-on:OnInput="onInput"></login-form>
      <h1 v-if="currentUser != null">{{ currentUser.displayName }}様</h1>
      <h2 v-if="errorMes != ''" style="color: red">{{ errorMes }}</h2>
      <div class="form_link_group">
        <button type="button" class="btn btn-success" @click="signin(email, password)">ログイン</button>
        <p><RouterLink v-bind:to="{ name: 'signup' }" class="link">アカウントの新規登録</RouterLink></p>
      </div>
      
    </article>
  </article>
  
  
</template>
<style scoped>

.login_page{
  width: 536px;
  margin: auto;
}

.link {
  margin-top: 30px;
  text-decoration: none;
  color: var(--other-color);
}

.form_card{
  background-color: white;
  border-radius: 20px;
  margin: auto;
  padding: 48px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 10px;
}
.form_link_group{
  margin-top: 50px;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
}
.form_link_group >p{
  font-size: 18px;
  font-weight: 500;
    transition: color 250ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
.form_link_group >button{
  width: 50%;
  padding: 0.625rem;
  margin-bottom: 1.5rem;
  height: 48px;
  line-height: 1.25;
  font-weight: 500;
  max-width: 240px;
  box-shadow: rgba(60, 69, 50, 0.2) 0px 6px 20px;
  transition-property: background-color, color, box-shadow;
    transition-duration: 150ms;
    transition-timing-function: ease-in-out;
}
.title{
  display: flex;
  align-items: center;
  padding: 30px 0;
}
</style>
