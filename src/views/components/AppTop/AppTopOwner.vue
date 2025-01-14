<script setup lang="ts">
import router from '@/router'
import {
  getAuth,
  signOut,
} from 'firebase/auth'
import {useIconStore}from "@/stores/icon"
import { usefireUserStore } from '@/stores/fireUserdata';
import { ref,watch } from 'vue'
enum PageMode{
  home="Home",
  order="Order",
  registration="Registation",
  mypage="Mypage",
  owner="Onwer",
  None="null",
  login="login",
  logout="Logout",
    chat="Chat",
  announcements="Announcements"
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
    Murone="室根",
    Kawasaki="川崎",
    None=""
  }
const iconStore = (useIconStore())
const auth = getAuth()
const myRole = ref<string>("")
const fireUseStore=usefireUserStore()
const myUserData=ref<Usertables>(fireUseStore.myUserData)
function logout() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      iconStore.deleteURL()
      router.push("/")
    })
}
async function onClickCard(mode: PageMode) {
  switch (mode) {
    case PageMode.home:
      await router.push("/");
      break;
    case PageMode.order:
      await router.push("/order");
      break;
    case PageMode.registration:
      await router.push("/registration");
      break;
    case PageMode.mypage:
      await router.push("/my-page");
      break;
    case PageMode.owner:
      await router.push("/Owner");
      break;
    case PageMode.login:
      await router.push("/login");
      break;
      case PageMode.chat:
      await router.push("/chat");
      break;
      case PageMode.announcements:
      await router.push("/announcements");
      break;
    case PageMode.logout:
      await logout();
      break;
    default:
      break;
  }
}
watch(() => fireUseStore.myUserData, (newUser) => {
  myUserData.value = newUser;
  myRole.value=myUserData.value.role
});
</script>
<template>
<div class="card_group">
  <div class="card">
    <h2>注文</h2>
    <p>野菜の注文ができます</p>
    <button v-on:click="onClickCard(PageMode.order)">注文へ</button>
  </div>
  <div class="card" v-if="myRole!=Role.Buyer">
    <h2>登録</h2>
    <p>自分が作った野菜を登録することができます</p>
    <button v-on:click="onClickCard(PageMode.registration)">登録へ</button>
  </div>
  <div class="card">
    <h2>チャット</h2>
    <p>管理者や同業者、道の駅などの人たちと会話することができます</p>
    <button v-on:click="onClickCard(PageMode.chat)">チャットへ</button>
  </div>
  <div class="card">
    <h2>掲示板</h2>
    <p>管理者からの連絡事項を見ることができます</p>
    <button v-on:click="onClickCard(PageMode.announcements)">掲示板へ</button>
  </div>
  <div class="card">
    <h2>マイページ</h2>
    <p>自分の情報の更新や過去の注文を確認することができます</p>
    <button v-on:click="onClickCard(PageMode.mypage)">マイページへ</button>
  </div>
  <div class="card" v-if="myRole!=Role.Buyer && myRole!=Role.Farmer">
    <h2>管理者画面</h2>
    <p>注文画面の野菜の並べ替えや各種データの出力や初期設定などができます</p>
    <button v-on:click="onClickCard(PageMode.owner)">管理者画面へ</button>
  </div>
</div>
</template>
<style scoped>
.link{
    text-decoration: none;
    color: white;
}
p{
    margin: 0;
}
.card{
  width: 340px;
  height: 175px;
  padding: 10px 20px;
  margin: 20px 20px;
  border: none;
  text-align: left;
  color: var(--text-color);
}
.card h2{
  font-size: 20px;
  border-bottom:1px  solid var(--text-color);
}
.card p{
  font-size: 16px;
  height: 60px;
  margin-top: 10px;
}
.card button{
  width: 140px;
  height: 35px;
  background-color: var(--main-color);
  border-radius: 50px;
  color: white;
  border: none;
}
.card i{
  color: black;
}
.card.logout{
  padding: 18px;
  height: 100px;
}
.card_group{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 800px;
  margin: auto;
}
.card p{
  font-size: 18px;
  height: 60px;
}
.card_button{
  padding: 15px;
  width: 150px;
  margin-top: 30px;
  border-radius: 30px;
  background-color: var(--main-color);
  color: white;
  font-size: 18px;
  border: none;
}
@media (max-width: 575.98px) { 
  .card_group{
    justify-content: center;
  }
  .card{
    margin: 10px 0;
  }
  .card_group{
    width: auto;
  }
 }
</style>