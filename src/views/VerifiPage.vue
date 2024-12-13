<script setup lang="ts">
import {
  getAuth,
  onAuthStateChanged,
  confirmPasswordReset,
  applyActionCode,
  type User
} from 'firebase/auth'
import {  computed, watch } from 'vue'
import { ref, onMounted } from 'vue'
import '../assets/main.css'
import router from '../router'
// ログインしているユーザーデータ
const currentUser = ref<User | null>(null)
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
function OnPushBack(){
  router.push("/login")
}
</script>

<template>
  <article class="reset_page">
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
  display: flex;
  border: none;
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
.form_card{
  background-color: white;
  border-radius: 20px;
  margin: auto;
  width: 512px!important;
  padding: 48px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 10px;
}
.title {
  display: flex;
  align-items: center;
  padding: 30px 0;
  color: var(--text-color)!important;
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
