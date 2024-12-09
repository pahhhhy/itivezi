<script setup lang="ts">
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  type User
} from 'firebase/auth'
import {  computed, watch } from 'vue'
import { ref, onMounted } from 'vue'
import '../assets/main.css'
import router from '../router'
// ログインしているユーザーデータ
const currentUser = ref<User | null>(null)
const email = ref<string>('')
const password = ref<string>('')
const isPopup = ref<boolean>(false)
const errorMes = ref<string>('')
const name = ref<string>('')
const onemorePas=ref<string>("")
const isName=ref<boolean>(true)
const isPassword=ref<boolean>(true)
const isEmail=ref<boolean>(true)
const isOnemore=ref<boolean>(true)
const errorPassword=ref<string>('')
//メールの認証メールを送ってから認証するまでユーザーでータを監視して
//認証したらログインページに飛ばすようにする
let intervalId:ReturnType<typeof setInterval>|null=null
const isVerified=computed(() => currentUser.value!=null&&currentUser.value.emailVerified);
const isClear=computed(() => currentUser.value!=null&&!currentUser.value.emailVerified);
watch(isClear, (newVal): void => {
  if (newVal) {
    startUpdatingInfo();
  } else {
    stopUpdatingInfo();
  }
})
watch(isVerified, (newVal): void => {
  if (newVal) {
    router.push("/add-info")
  }
})
// 情報を更新する関数
async function updateInfo() {
  const auth = getAuth();
  if (auth.currentUser) {
    await auth.currentUser.reload(); // ユーザー情報を更新
    currentUser.value = { ...auth.currentUser }; // 新しいオブジェクトとして再代入
  } else {
    currentUser.value = null;
  }
}
// インターバルを開始する関数
function startUpdatingInfo() {
  if (intervalId !== null) return; // 既にインターバルが実行中の場合は何もしない
  intervalId = setInterval(() => {
    updateInfo();
  }, 1000); // 1秒ごとに更新
}

// インターバルを停止する関数
function stopUpdatingInfo() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null; // インターバルIDをリセット
  }
}
//確認メールの送信
function sendEmailVerifi(user: User) {
  sendEmailVerification(user)
    .then(() => {
      // Email verification sent!
      
    })
    
}

watch(email, (): void => {
  if(email.value!='')isEmail.value=true
})
watch(password, (): void => {
  if(password.value!='')isPassword.value=true
})
watch(name, (): void => {
  if(name.value!='')isName.value=true
})
watch(onemorePas, (): void => {
  if(onemorePas.value!='')isOnemore.value=true
})
// サインアップ処理
function isValidPassword(password:string) {
  // 正規表現: 英数字のみ、8〜20文字
  const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
  return passwordRegex.test(password);
}
async function createAccount(email: string, password: string, name: string) {
  const auth = getAuth()
  if (email == '' || password == ''||name ==''||!isValidPassword(password)||onemorePas.value!=password) {
    if(name=='')isName.value=false
    if(!isValidPassword(password)) {
      isPassword.value=false
    errorPassword.value="パスワードは英数字を使用した8~20文字にしてください"
  }
    if(password==''){
      isPassword.value=false
      errorPassword.value="パスワードを入力してください"
    }
    if(email=='')isEmail.value=false
    if(onemorePas.value!=password) isOnemore.value=false
    return
  }
  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 成功時処理
      const user = userCredential.user
      
      isPopup.value = true
      sendEmailVerifi(user)
      const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user != null ) {
      currentUser.value = user
      
    } else {
      currentUser.value = null
    }
  })
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
      errorMes.value = 'パスワードは英数字を使用した8~20文字にしてください'
      break
    case 'Firebase: Error (auth/email-already-in-use).':
      errorMes.value = 'メールアドレスはもうつかわれています'
      break
    default:
      errorMes.value = ''
      break
  }
}
onMounted(() => {
  const auth = getAuth()
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
 
  
  <article class="signup_page">
    
    <div class="title">
      <h1>アカウントの新規作成</h1>
    </div>
    <article class="form_card">
      <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">アカウント名</label>
        <input
          type="text"
          class="form-control"
          id="exampleFormControlInput1"
          placeholder="name"
          v-model="name"
        />
      </div>
      <p v-if="!isName" class="errorMessage">アカウント名を入力してください</p>
      <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">メールアドレス</label>
        <input
          type="email"
          class="form-control"
          id="exampleFormControlInput1"
          placeholder="name@example.com"
          v-model="email"
        />
      </div>
      <p v-if="!isEmail" class="errorMessage">メールアドレスを入力してください</p>
      <p v-if="errorMes != ''" class="errorMessage">{{ errorMes }}</p>
      <label for="inputPassword5" class="form-label">パスワード</label>
      <input
        type="password"
        id="inputPassword5"
        class="form-control"
        aria-labelledby="passwordHelpBlock"
        v-model="password"
      />
      
      <div id="passwordHelpBlock" class="form-text">
        パスワードは 8 ～ 20
        文字で、文字と数字を含める必要があります。スペース、特殊文字、絵文字を含めることはできません。
      </div>
      <p v-if="!isPassword" class="errorMessage">{{errorPassword}}</p>
      <label for="inputPassword5" class="form-label">パスワードの再入力</label>
      <input
        type="password"
        id="inputPassword5"
        class="form-control"
        aria-labelledby="passwordHelpBlock"
        v-model="onemorePas"
      />
      <p v-if="!isOnemore" class="errorMessage">パスワードが一致しません</p>
      <div class="d-flex justify-content-center my-3 ">
        <button type="button" class="btn btn-success form_button" @click="createAccount(email, password, name)">
          登録する
        </button>
      </div>
      
      
    </article>
    <section class="popup_signup" v-show="isPopup">
      <h2>
        メールアドレスの確認メールをおくりました<br />メールの認証を行うと自動で次のページに移ります
      </h2>
      <!-- <button class="btn btn-success form_button " v-on:click="OnPushBack"> 戻る</button> -->
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
.errorMessage{
  color: red;
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
