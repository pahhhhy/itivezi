<script setup lang="ts">
import { computed, ref as Vueref, onMounted } from 'vue'
import { getDatabase, ref as Fireref, child, get, onValue, set, remove } from 'firebase/database'

import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  type User
} from 'firebase/auth'
import { RouterLink } from 'vue-router'
import router from '@/router'
const currentUser = Vueref<User | null>(null)
const UserData = Vueref<any>(ReadUserData(''))
const UserName = Vueref<string>('')
const Selectrole = Vueref<string>('')
const placeData = Vueref<string>('')
// 読み込むデータの指定
function ReadUserData(element: string) {
  const CountRef = Fireref(getDatabase(), 'testUser/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}
function updateDisname(user: User, name: string) {
  updateProfile(user, { displayName: name })
    .then(() => {
      // 成功時の処理
      console.log('Display name updated successfully.' + name)
    })
    .catch((error) => {
      // 失敗時の処理
      console.error('Error updating display name:', error)
    })
}
//指定したデータを書き込むようにしている。Vegeに該当の野菜
function writeUserdata(uid: string, role: string, place: string) {
  const db = getDatabase()

  set(Fireref(db, 'testUser/' + uid), {
    role: role,
    place: place
  })
}
//一度にすべての入力を元に更新する
function UpdateInfo() {
  if (Selectrole.value != '' || placeData.value != '') {
    if (currentUser.value != null) {
      updateDisname(currentUser.value, UserName.value)
      writeUserdata(currentUser.value.uid, Selectrole.value, placeData.value)
      router.push('/')
    }
  } else {
    console.log('入力をしてください')
  }
}
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      console.log('読み込みました')
      if (currentUser.value.displayName != null) {
        UserName.value = currentUser.value.displayName
      }
    } else {
      currentUser.value = null
    }
  })
})
</script>

<template>
  <div class="title">
    <h1>追加情報</h1>
    <h2>{{ UserName }}</h2>
    <h2>{{ Selectrole }}</h2>
  </div>
  <div class="mb-3">
    <label for="exampleFormControlInput1" class="form-label">名前</label>
    <input
      type="text"
      class="form-control"
      id="exampleFormControlInput1"
      placeholder="name"
      v-model="UserName"
    />
  </div>

  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      value="農家"
      name="flexRadioDefault"
      v-model="Selectrole"
      id="flexRadioDefault1"
    />
    <label class="form-check-label" for="flexRadioDefault1"> 農家 </label>
  </div>
  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      name="flexRadioDefault"
      value="飲食店"
      id="flexRadioDefault2"
      v-model="Selectrole"
    />
    <label class="form-check-label" for="flexRadioDefault2"> 飲食店 </label>
  </div>
  <div class="mb-3">
    <label for="exampleFormControlInput1" class="form-label">住所</label>
    <input
      type="text"
      class="form-control"
      id="exampleFormControlInput1"
      placeholder="住所"
      v-model="placeData"
    />
  </div>
  <button type="button" class="btn btn-primary" @click="UpdateInfo">更新する</button>
</template>
<style>
.title {
  text-align: center;
}
</style>
