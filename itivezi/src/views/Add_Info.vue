<script setup lang="ts">
import { ref as Vueref, onMounted, watch } from 'vue'
import { getDatabase, ref as Fireref, onValue, set } from 'firebase/database'

import { getAuth, onAuthStateChanged, updateProfile, type User } from 'firebase/auth'
import router from '@/router'
const currentUser = Vueref<User | null>(null)
const UserData = Vueref<any>(ReadUserData(''))
const UserName = Vueref<string>('')
const Selectrole = Vueref<string>('')
const placeData = Vueref<string>('')
const Gender = Vueref<string>('')
const PhoneNumber = Vueref<number>()

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
function writeUserdata(
  uid: string,
  role: string,
  place: string,
  number: number,
  gender: string,
  name: string
) {
  const db = getDatabase()

  set(Fireref(db, 'testUser/' + uid), {
    name: name,
    role: role,
    place: place,
    PhoneNumber: number,
    Gender: gender
  })
}
//一度にすべての入力を元に更新する
function UpdateInfo() {
  if (
    Selectrole.value != '' &&
    placeData.value != '' &&
    PhoneNumber.value != undefined &&
    Gender.value != ''
  ) {
    if (currentUser.value != null) {
      updateDisname(currentUser.value, UserName.value)
      writeUserdata(
        currentUser.value.uid,
        Selectrole.value,
        placeData.value,
        PhoneNumber.value,
        Gender.value,
        UserName.value
      )

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
watch(UserData, (): void => {
  if (currentUser.value != null) {
    Selectrole.value = UserData.value[currentUser.value.uid].role
    placeData.value = UserData.value[currentUser.value.uid].place
    Gender.value = UserData.value[currentUser.value.uid].Gender
    PhoneNumber.value = UserData.value[currentUser.value.uid].PhoneNumber
  }
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
  <h3>性別</h3>
  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      value="men"
      name="gender"
      v-model="Gender"
      id="genderMen"
    />
    <label class="form-check-label" for="genderMen"> 男 </label>
  </div>
  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      name="gender"
      value="women"
      id="genderWomen"
      v-model="Gender"
    />
    <label class="form-check-label" for="genderWomen"> 女 </label>
  </div>
  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      name="gender"
      value="other"
      id="genderOther"
      v-model="Gender"
    />
    <label class="form-check-label" for="genderOther"> その他 </label>
  </div>

  <h3>役職</h3>
  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      value="農家"
      name="role"
      v-model="Selectrole"
      id="roleFarmer"
    />
    <label class="form-check-label" for="roleFarmer"> 農家 </label>
  </div>
  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      name="role"
      value="飲食店"
      id="roleRestaurant"
      v-model="Selectrole"
    />
    <label class="form-check-label" for="roleRestaurant"> 飲食店 </label>
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
