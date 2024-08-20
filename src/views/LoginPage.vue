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
  console.log("isOk:"+isOk)
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
  <div class="title">
    <h1>ログイン</h1>
    <h2></h2>
  </div>
  <login-form v-on:OnInput="onInput"></login-form>
  <h1>{{ email }}</h1>
  <h1 v-if="currentUser != null">{{ currentUser.displayName }}様</h1>
  <h2 v-if="errorMes != ''" style="color: red">{{ errorMes }}</h2>
  <button type="button" class="btn btn-primary" @click="signin(email, password)">ログイン</button>
  <p>初めての方は</p>
  <h1><RouterLink v-bind:to="{ name: 'signup' }" class="link">新規会員登録</RouterLink></h1>
</template>
<style scoped>
.link {
  text-decoration: none;
  color: black;
}
</style>
