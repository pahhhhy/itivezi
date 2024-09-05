<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { getDatabase, ref as fireRef, onValue } from 'firebase/database'
import router from '@/router'
const myRole = ref<string>("")
const isBurger = ref(false)
const currentUser = ref<User | null>(null)
const onClickBurger = (): void => {
  isBurger.value = !isBurger.value
}
const auth = getAuth()
function logout() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      router.push("/")
    })
}
onMounted(async () => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      try {
        const userData = await readUserData(currentUser.value!.uid)
        myRole.value = userData.role
       
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    } else {
      currentUser.value = null
    }
  })
})
//読みこむデータの指定
async function readUserData(element: string): Promise<any> {
  const countRef = fireRef(getDatabase(), 'testUser/' + element)
  return new Promise((resolve, reject) => {
    onValue(
      countRef,
      (snapshot) => {
        resolve(snapshot.val())
      },
      (error) => {
        reject(error)
      }
    )
  })
}
</script>

<template>
  <header>
    <img src="..\\assets\\itivezilogo.png" alt="" />

    <nav>
      <p v-if="currentUser != null">{{ currentUser.displayName }}様</p>
      <i v-if="!isBurger" v-on:click="onClickBurger" class="bi bi-justify burger"></i>
      <i v-if="isBurger" v-on:click="onClickBurger" class="bi bi-x-lg burger"></i>
    </nav>
  </header>
  <aside v-if="isBurger">
    <ul>
      <li>
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'top' }" class="link">Top</RouterLink>
        </button>
      </li>

      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'order' }" class="link">注文</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'registration' }" class="link">登録</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'my-page' }" class="link">マイページ</RouterLink>
        </button>
      </li>
      <li v-if="currentUser == null">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'login' }" class="link">ログイン/新規登録</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null && myRole == '管理者'">
        <button v-on:click="onClickBurger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'Owner' }" class="link">管理者画面</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="onClickBurger" class="sidebar_element" style="display: flex">
          <i class="bi bi-journals"></i>
          <p @click="logout" class="link">ログアウト</p>
        </button>
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
.burger {
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
.sidebar_element {
  border: none;
  background-color: white;
}
</style>
