<script setup lang="ts">
import { RouterLink } from 'vue-router'
import router from '../router'
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth'
import { ref, watch } from 'vue'
import LoginForm from './components/LoginForm.vue'
import { getStorage, ref as storageRef, getMetadata } from 'firebase/storage';
import '../assets/main.css'
import { useUserStore } from '@/stores/userData';
import { usefireUserStore } from '@/stores/fireUserdata';
import { useVegeStore } from '@/stores/vege';
import { useCartStore } from '@/stores/cart';
import { useFireOrderStore } from '@/stores/fireOrder';
import { useSortVegeStore } from '@/stores/sortByVege';
interface AllUserTables{
  [uid:string]:Usertables
}
interface Usertables{
    affiliation:String[]
   
    name:string
    phoneNumber:number
    place:string
    role:Role
    email:string
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    None=""
  }
  enum SortMode{
    All="all",
    Kawasaki="川崎",
    Murone="室根",
    Other="その他"
}
const userStore=useUserStore()
const currentUser = ref<User|null>(userStore.currentUser);

const fireUseStore=usefireUserStore()
const email = ref<string>('')
const password = ref<string>('')
const errorMes = ref<string>('')
const userData = ref<AllUserTables>({})
const changeemail=ref<string>("")
const isForget=ref<boolean>(false)
const vegeStore=useVegeStore()
const sortVegeStore=useSortVegeStore()
const FireOrderStore=useFireOrderStore()
const CartStore=useCartStore()
const auth = getAuth();
const isPopup=ref<Boolean>(false)
  async function roadData(){
  await userStore.roadUserData()
  await vegeStore.roadData()
  await FireOrderStore.roadData()
  await sortVegeStore.roadData(SortMode.All)
  CartStore.roadData()
  currentUser.value=userStore.currentUser
  if(currentUser.value){
    await fireUseStore.roadFireUseData(currentUser.value.uid)
  }
  
else
console.log("error")
}
  watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
async function initData(){
  userData.value=await fireUseStore.AllroadFireUseData()
}
initData()
async function checkMyData() {
  let isOk = true

  if (currentUser.value != null) {
    if (userData.value[currentUser.value.uid] == null) {
      isOk = false
    } else {
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
        userData.value[currentUser.value.uid].affiliation.length == 0
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
            roadData()
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


function resetPassword() {
  sendPasswordResetEmail(auth, changeemail.value)
    .then(() => {
      isPopup.value=true
      console.log('パスワードリセットメールが送信されました:'+isPopup.value);
    })
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
      console.error('このメールアドレスのユーザーが存在しません');
    } else {
      console.error('エラーが発生しました:', error);
    }
    });
  }
function onPushChangePass(){
  isForget.value=!isForget.value
}
</script>
<template>
  <article class="login_page" v-if="!isForget">
    <div class="title">
      <h1>ログイン</h1>
    </div>
    <article class="form_card">
      <login-form v-on:OnInput="onInput"></login-form>
      <h2 v-if="errorMes != ''" style="color: red">{{ errorMes }}</h2>
      <div class="form_link_group">
        <button type="button" class="btn btn-success" @click="signin(email, password)">ログイン</button>
        <button class="passforget_button" @click="onPushChangePass">パスワードを忘れた</button>
        <p><RouterLink v-bind:to="{ name: 'signup' }" class="link">アカウントの新規登録</RouterLink></p>
      </div>
      
    </article>
  </article>
  <article class="login_page" v-if="isForget">
    <div class="title">
      <h1>パスワードの変更</h1>
    </div>
    <article class="form_card">

      <label for="exampleFormControlInput1" class="form-label">メールアドレス</label>
      <input type="email" id="email" placeholder="name@example.com" required v-model="changeemail" class="form-control">
      <div class="form_link_group">
        <button type="button" class="btn btn-success" @click="resetPassword()">送信</button>
        <button type="button" class="btn btn-success" @click="onPushChangePass">戻る</button>
      </div>
      
    </article>
    <article class="forget_popup" v-if="isPopup">
      <p>パスワードの再設定メールを送りました。<br>メールを開き、確認してください。</p>
    </article>
    <div class="blackback" v-if="isPopup"></div>
  </article>
  
  
</template>
<style scoped>

.login_page{
  width: 512px;
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
  width: 70%;
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
.passforget_button{
  border: none;
  color: var(--other-color);
  box-shadow: none!important;
  background-color: white;
}
.title{
  display: flex;
  align-items: center;
  padding: 30px 0;
  border: none;
}
.forget_popup{
  width: 512px;
  position: fixed;
  top: 300px;
  left: calc(50% - 256px);
  background-color: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: rgba(60, 69, 50, 0.2) 0px 6px 20px;
  z-index: 20;
}
.forget_popup p{
  font-size: 24px;
}
.blackback{
  position: fixed;
  display: block;
  top: 80px;
  left: 0;
  background-color:rgba(3,3,3); ;
  opacity: 0.5;
  width: 100vw;
  height: 100vh;
  z-index: 10;

}

@media (max-width: 536px) { 
  .title{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .login_page{
    width: 380px;
    margin: auto;
  }
  .form_card{
    padding: 36px;
    width: 340px;
  }
  .form_link_group >button{
    height: 48px;
    margin-bottom: 18px;
  }
  .forget_popup{
    width: 340px;
    left: calc(50% - 170px);
  }
  }
</style>
