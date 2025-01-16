<script setup lang="ts">
import {
  getAuth,
  onAuthStateChanged,
  confirmPasswordReset,
  applyActionCode,
  type User
} from 'firebase/auth'
import {   watch } from 'vue'
import { ref, onMounted } from 'vue'
import '../assets/main.css'
import router from '../router'
// ログインしているユーザーデータ
const currentUser = ref<User | null>(null)
const mode=ref<string>("")
//resetPageの変数
const password = ref<string>('')
const isPopup = ref<boolean>(false)
const errorMes = ref<string>('')
const onemorePas=ref<string>("")
const isPassword=ref<boolean>(true)
const isOnemore=ref<boolean>(true)
const errorPassword=ref<string>('')
// URLパラメータからoobCodeを取得
const urlParams = new URLSearchParams(window.location.search);
 const oobCode = ref(urlParams.get("oobCode")||"");
 if(urlParams .get('mode')=="verifyEmail"){
        mode.value="verifyEmail"
      }else if(urlParams .get('mode')=="resetPassword"){
        mode.value="resetPassword"
      }
// Firebase認証インスタンスの取得
const auth = getAuth()
 const message=ref<string>("")
 async function verification(){
    try {
      // URLからoobCodeを取得
      const queryParams = new URLSearchParams(window.location.search);
      const oobCode = queryParams.get('oobCode');
      if (!oobCode) {
        message.value = '無効なリクエストです。';
        return;
      }

      // oobCodeを使用してメールアドレスを確認
      await applyActionCode(auth,oobCode)

      message.value = 'メールアドレスの確認が完了しました！ログインページに移動してください！';
    } catch (error) {
      console.error('メールアドレス確認中にエラーが発生:', error);
      message.value = 'メールアドレスの確認に失敗しました。';
    }
 }
// サインアップ処理
function isValidPassword(password:string) {
  // 正規表現: 英数字のみ、8〜20文字、英字と数字を必ず含む
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,20}$/;
  return passwordRegex.test(password);
}
//パスワードのリセットを行ってポップアップを表示する
async function ResetPassWord(password: string) {
  if ( password == ''||!isValidPassword(password)||onemorePas.value!=password) {
    if(!isValidPassword(password)) {
      isPassword.value=false
    errorPassword.value="パスワードは英数字を使用した8~20文字にしてください"
  }
    if(password==''){
      isPassword.value=false
      errorPassword.value="パスワードを入力してください"
    }
    if(onemorePas.value!=password) isOnemore.value=false
    return
  }
  try {
        await confirmPasswordReset(getAuth(), oobCode.value, password);
        isPopup.value=true
      } catch (err) {
        console.error("失敗しました:"+err)
      }

}

onMounted(() => {
  const auth = getAuth()
  verification()
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      
    } else {
      currentUser.value = null
    }
  })
})
watch(password, (): void => {
  if(password.value!='')isPassword.value=true
})
watch(onemorePas, (): void => {
  if(onemorePas.value!='')isOnemore.value=true
})
function OnPushBack(){
  router.push("/login")
}
</script>

<template>
  <article v-if="mode==''">エラーが発生しました</article>
  <article class="reset_page" v-if="mode=='verifyEmail'">
    <div class="title">
      <h1>メールアドレスの確認</h1>
      
    </div>
    <p v-if="message==''">確認中…</p>
      <p>{{message}}</p>
      <div class="d-flex justify-content-center my-3 ">
        <button type="button" class="btn btn-success form_button" v-on:click="OnPushBack">
          ログインへ
        </button>
      </div>
    </article>
    
      
      <article class="reset_page" v-if="mode=='resetPassword'">
        <div class="title">
          <h1>パスワードの再設定</h1>
        </div>
        <p v-if="errorMes != ''" class="errorMessage">{{ errorMes }}</p>
        <label for="inputPassword5" class="form-label">新しいパスワード</label>
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
          <button type="button" class="btn btn-success form_button" @click="ResetPassWord( password)">
            変更する
          </button>
        </div>
        
        <section class="popup_reset" v-show="isPopup">
          <h2>
            パスワードの再設定を行いました<br />ログインページでログインしてください。
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
.title{
  margin: 0 auto;
  border: none;
  display: flex;
  align-items: center;
  padding: 30px 0;
  color: var(--text-color)!important;
}
.title i{
  font-size: 24px;
  padding: 2px;
}
.reset_page{
  width: 512px!important;
  margin: auto;
  margin-top: 50px;
  background-color: white;
  padding: 30px;
}
.reset_page p{
    font-size: 20px;
}
.popup_reset {
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
.popup_reset>button{
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
@media (max-width: 575.98px) {
  .reset_page{
    width: 340px!important;
    margin: auto;
    margin-top: 50px;
  }
  .form_card{
    width: 340px!important;
  }
 }

</style>
