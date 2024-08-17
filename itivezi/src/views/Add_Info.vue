<script setup lang="ts">
import { ref as Vueref, onMounted } from 'vue'
import { getDatabase, ref as Fireref, onValue, set } from 'firebase/database'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getAuth, onAuthStateChanged, updateProfile, type User } from 'firebase/auth'
import router from '@/router'

// カスタムクレームの作成
enum UserRole {
  ADMIN = 'admin',
  Roadside = 'roadside',
  USER = 'user',
  PRODUCER = 'producer',
  NULL = 'null'
}
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  NULL = 'null'
}
const currentUser = Vueref<User | null>(null)
const UserName = Vueref<string>('')
const Selectrole = Vueref<UserRole>(UserRole.NULL)
const SelectGender = Vueref<Gender>(Gender.NULL)
const placeData = Vueref<string>('')
const PhoneNumber = Vueref<number>(0)
// カスタムクレームを設定する関数
const setUserClaims = async (claims: object) => {
  const functions = getFunctions()
  const addCustomClaims = httpsCallable(functions, 'addCustomClaims')
  await addCustomClaims({ uid: currentUser.value?.uid, claims })
  await currentUser.value?.getIdToken(true)
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

// 一度にすべての入力を元に更新する
function UpdateInfo() {
  if (Selectrole.value != UserRole.NULL || placeData.value != '') {
    if (currentUser.value != null) {
      updateDisname(currentUser.value, UserName.value)
      setUserClaims({
        role: Selectrole.value,
        gender: SelectGender.value,
        phoneNumber: PhoneNumber.value,
        place: placeData.value
      })
        .then(() => {
          console.log('更新に成功しました')
          router.push('/')
        })
        .catch((error) => {
          console.error('更新に失敗しました:', error)
        })
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
      :value="UserRole.PRODUCER"
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
      :value="UserRole.USER"
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
  <div class="mb-3">
    <label for="exampleFormControlInput1" class="form-label">電話番号</label>
    <input
      type="number"
      class="form-control"
      id="exampleFormControlInput1"
      placeholder="電話番号 ハイフンなし"
      v-model="PhoneNumber"
    />
  </div>
  <button type="button" class="btn btn-primary" @click="UpdateInfo">更新する</button>
</template>
<style>
.title {
  text-align: center;
}
</style>
