<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User
} from 'firebase/auth'
const Isbarger = ref(false)
const currentUser = ref<User | null>(null)
const ClickBarger = (): void => {
  if (Isbarger.value) {
    Isbarger.value = false
  } else {
    Isbarger.value = true
  }
}
const auth = getAuth()
function rogout() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      console.log('ログアウトしました')
    })
    .catch((error) => {
      // An error happened.
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorCode, errorMessage)
    })
}

onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      console.log('読み込みました')
    } else {
      currentUser.value = null
    }
  })
})
</script>

<template>
  <header>
    <img src="..\\assets\\itivezilogo.png" alt="" />

    <nav>
      <p v-if="currentUser != null">{{ currentUser.displayName }}様</p>
      <i v-if="!Isbarger" v-on:click="ClickBarger" class="bi bi-justify barger"></i>
      <i v-if="Isbarger" v-on:click="ClickBarger" class="bi bi-x-lg barger"></i>
    </nav>
  </header>
  <aside v-show="Isbarger">
    <ul>
      <li>
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'AppTop' }" class="link">Top</RouterLink>
      </li>
      <li v-if="currentUser != null">
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'orderpage' }" class="link">注文</RouterLink>
      </li>
      <li v-if="currentUser != null">
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'Registration' }" class="link">登録</RouterLink>
      </li>
      <li v-if="currentUser != null">
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'mypage' }" class="link">マイページ</RouterLink>
      </li>
      <li v-if="currentUser == null">
        <i class="bi bi-journals"></i>
        <RouterLink v-bind:to="{ name: 'rogin' }" class="link">ログイン/新規登録</RouterLink>
      </li>
      <li v-if="currentUser != null" style="display: flex">
        <i class="bi bi-journals"></i>
        <p @click="rogout" class="link" style="margin: auto 0">ログアウト</p>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
body {
  position: relative;
}
header {
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-bottom: 3px solid black;
}
nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.barger {
  font-size: 40px;
  color: greenyellow;
}
aside {
  height: 100%;
  width: 200px;
  position: fixed;
  border-right: 3px solid black;
  background-color: white;
  z-index: 1;
}
aside i {
  font-size: 20px;
  color: green;
}
aside ul {
  font-size: 18px;
  padding: 0;
  color: green;
}
aside li {
  list-style: none;
  padding: 10px 5px 10px 10px;
  border-top: 1px solid grey;
  border-bottom: 1px solid grey;
}
.link {
  text-decoration: none;
  color: black;
}
</style>
