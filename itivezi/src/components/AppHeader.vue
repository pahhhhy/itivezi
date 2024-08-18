<script setup lang="ts">
import { computed, ref as Vueref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User
} from 'firebase/auth'
import { getDatabase, ref, onValue } from 'firebase/database'
const Isbarger = Vueref(false)
const currentUser = Vueref<User | null>(null)
const ClickBarger = (): void => {
  Isbarger.value = !Isbarger.value
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
const MyRole = Vueref<any>()
onMounted(async () => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      try {
        const userData = await ReadUserData(currentUser.value!.uid)
        MyRole.value = userData.role
        console.log('読みこんだ')
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    } else {
      currentUser.value = null
    }
  })
})
//読みこむデータの指定
async function ReadUserData(element: string): Promise<any> {
  const CountRef = ref(getDatabase(), 'testUser/' + element)
  return new Promise((resolve, reject) => {
    onValue(
      CountRef,
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
      <i v-if="!Isbarger" v-on:click="ClickBarger" class="bi bi-justify barger"></i>
      <i v-if="Isbarger" v-on:click="ClickBarger" class="bi bi-x-lg barger"></i>
    </nav>
  </header>
  <aside v-if="Isbarger">
    <ul>
      <li>
        <button v-on:click="ClickBarger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'AppTop' }" class="link">Top</RouterLink>
        </button>
      </li>

      <li v-if="currentUser != null">
        <button v-on:click="ClickBarger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'orderpage' }" class="link">注文</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="ClickBarger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'Registration' }" class="link">登録</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="ClickBarger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'mypage' }" class="link">マイページ</RouterLink>
        </button>
      </li>
      <li v-if="currentUser == null">
        <button v-on:click="ClickBarger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'rogin' }" class="link">ログイン/新規登録</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null && MyRole == '管理者'">
        <button v-on:click="ClickBarger" class="sidebar_element">
          <i class="bi bi-journals"></i>
          <RouterLink v-bind:to="{ name: 'Owner' }" class="link">管理者画面</RouterLink>
        </button>
      </li>
      <li v-if="currentUser != null">
        <button v-on:click="ClickBarger" class="sidebar_element" style="display: flex">
          <i class="bi bi-journals"></i>
          <p @click="rogout" class="link">ログアウト</p>
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
.sidebar_element {
  border: none;
  background-color: white;
}
</style>
