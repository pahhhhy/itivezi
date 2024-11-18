<script setup lang="ts">
import { RouterLink,useRoute } from 'vue-router'
import router from '@/router'
import {
  getAuth,
  signOut,
} from 'firebase/auth'
import {useIconStore}from "@/stores/icon"
enum PageMode{
  home="Home",
  order="Order",
  registration="Registation",
  mypage="Mypage",
  owner="Onwer",
  None="null",
  login="login",
  logout="Logout"
}
const iconStore = (useIconStore())
const auth = getAuth()
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
    case PageMode.logout:
      await logout();
      break;
    default:
      break;
  }
}

</script>
<template>
<div class="card_group">
      <div class="card" >
        <div class="card-body">
          <h5 class="card-title"><i class="bi bi-cart"></i>注文</h5>
          <p class="card-text">野菜の注文ができます</p>
          <button class="card_button" v-on:click="onClickCard(PageMode.order)">注文画面へ</button>
        </div>
      </div>
        <div class="card">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-cart"></i>登録</h5>
            <p class="card-text">自分が作った野菜を登録することで販売することができます。</p>
            <button class="card_button" v-on:click="onClickCard(PageMode.registration)">登録画面へ</button>
          </div>
        </div>
      <div class="card" >
        <div class="card-body">
          <h5 class="card-title"><i class="bi bi-person"></i>マイページ</h5>
          <p class="card-text">自分の情報の更新や過去の注文を確認することができます。</p>
          <button class="card_button" v-on:click="onClickCard(PageMode.mypage)">マイページへ</button>
        </div>
      </div>
        <div class="card" >
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-columns-gap"></i>管理者画面</h5>
            <p class="card-text">注文画面の野菜の並べ替えや各種データの出力や初期設定などをすることができます。</p>
            <button class="card_button" v-on:click="onClickCard(PageMode.owner)">管理画面へ</button>
          </div>
        </div>
        <div class="card logout" v-on:click="onClickCard(PageMode.logout)">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-box-arrow-in-left"></i>ログアウト</h5>
          </div>
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
  width: 400px;
  height: 250px;
  padding: 20px;
  margin: 15px 30px;
  text-align: left;
}
.card h5{
  color: var(--main-color);
  font-size: 24px;
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
@media (max-width: 850.98px) { 
  .card_group{
    justify-content: center;
  }
 }
</style>