<script setup lang="ts">
import {ref,watch} from 'vue'
import {RouterLink} from 'vue-router'
import AppTopOwner from './components/AppTop/AppTopOwner.vue';
import { useUserStore } from '@/stores/userData';
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
</script>

<template>

  <article v-if="currentUser == null">

    <div class="login-form">
      <h3>ログインすることでこのアプリを使うことができます。</h3>

      <button class="btn btn-success p-2 m-3">
        <RouterLink v-bind:to="{ name: 'login' }">新規登録/ログイン</RouterLink>
      </button>
    </div>
  </article>
  <article v-if="currentUser != null">
    <AppTopOwner ></AppTopOwner>
  </article>
</template>
<style>
.login-form h3{
  margin-top:24px ;
}
.login-form a{
  color: white;
  text-decoration: none;
}
.login-form{
  display: flex;
  align-items: center;
  flex-direction:column;
  margin: 0 20px;
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
</style>
