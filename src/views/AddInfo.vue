<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getDatabase, ref as fireRef , onValue, set } from 'firebase/database'
import { getAuth, onAuthStateChanged, updateProfile, type User } from 'firebase/auth'
import router from '@/router'
import {useIconStore}from "../stores/icon"
const iconStore = (useIconStore())
const currentUser = ref<User | null>(null)
const userData = ref<any>(readUserData(''))
const userName = ref<string>('')
const selectRole = ref<string>('')
const placeData = ref<string>('')
const gender = ref<string>('')
const phoneNumber = ref<number>()
const affiliation =ref<string[]>([])
const error=ref<boolean>(false)
const auth = getAuth();
// 選択された画像とプロフィール画像を格納する変数
const selectedImage = ref<any>(null);
const userProfileImage = ref(auth.currentUser?.photoURL || '');
// 画像選択時の処理
const onFileChange = (e:Event) => {
  const target = e.target as HTMLInputElement;  // HTMLInputElementにキャスト
  if (target && target.files) {
    selectedImage.value = target.files[0];  // 'files'にアクセス
    console.log(selectedImage.value)
    userProfileImage.value = URL.createObjectURL(selectedImage.value);
  }
};
// Firebase Storageに画像をアップロードし、Firebase Authのプロフィールを更新
const uploadImage = async () => {
  if (currentUser.value) {
    await iconStore.uploadImage(selectedImage.value, currentUser.value);
  } 
};
// 読み込むデータの指定
function readUserData(element: string) {
  const countRef = fireRef(getDatabase(), 'testUser/' + element)
  const data = ref<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}
function updateDisName(user: User, name: string) {
  updateProfile(user, { displayName: name })
    .then(() => {
      // 成功時の処理
      
    })
}
//指定したデータを書き込むようにしている。Vegeに該当の野菜
function writeUserdata(
  uid: string,
  role: string,
  place: string,
  number: number,
  gender: string,
  name: string,
  affiliation:string[]
) {
  const db = getDatabase()

  set(fireRef(db, 'testUser/' + uid), {
    name: name,
    role: role,
    place: place,
    phoneNumber: number,
    gender: gender,
    affiliation:affiliation
  })
}
//一度にすべての入力を元に更新する
function updateInfo() {
  if (
    selectRole.value != '' &&
    placeData.value != '' &&
    phoneNumber.value != undefined &&
    gender.value != ''&&
    userName.value!=""&&
    affiliation.value.length !=0&&
    currentUser.value?.photoURL!=null
  ) {
    if (currentUser.value != null) {
      updateDisName(currentUser.value, userName.value)
      writeUserdata(
        currentUser.value.uid,
        selectRole.value,
        placeData.value,
        phoneNumber.value,
        gender.value,
        userName.value,
        affiliation.value
      )

      router.push('/')
    }
  } else{
    error.value=true
  }
}
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      
      if (currentUser.value.displayName != null) {
        userName.value = currentUser.value.displayName
      }
    } else {
      currentUser.value = null
    }
  })
})
watch(userData, (): void => {
  if (currentUser.value != null) {
    selectRole.value = userData.value[currentUser.value.uid].role
    placeData.value = userData.value[currentUser.value.uid].place
    gender.value = userData.value[currentUser.value.uid].gender
    phoneNumber.value = userData.value[currentUser.value.uid].phoneNumber
  }
})

</script>

<template>
  <div class="title">
    <h1>追加情報</h1>
    <!-- <h2>{{ userName }}</h2>
    <h2>{{ selectRole }}</h2> -->
    
  </div>
  <div class="mb-3">
    <label for="exampleFormControlInput1" class="form-label">名前</label>
    <input
      type="text"
      class="form-control"
      id="exampleFormControlInput1"
      placeholder="name"
      v-model="userName"
    />
  </div>
  <div>
    <h3>プロフィール画像をアップロード</h3>
    <input type="file" @change="onFileChange" />
    <img :src="userProfileImage" class="aicon-image" alt="プロフィール画像" v-if="userProfileImage" />
    <button @click="uploadImage">アップロード</button>
  </div>
  <h3>性別</h3>
  <div class="form-check">
    <input
      class="form-check-input"
      type="radio"
      value="men"
      name="gender"
      v-model="gender"
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
      v-model="gender"
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
      v-model="gender"
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
      v-model="selectRole"
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
      v-model="selectRole"
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
      v-model="phoneNumber"
    />
  </div>
  <h3>所属</h3>
<div class="form-check">
  <input
    class="form-check-input"
    type="checkbox"
    value="室根"
    v-model="affiliation"
    id="affiliationMen"
  />
  <label class="form-check-label" for="affiliationMen"> 室根 </label>
</div>
<div class="form-check">
  <input
    class="form-check-input"
    type="checkbox"
    value="川崎"
    id="affiliationWomen"
    v-model="affiliation"
  />
  <label class="form-check-label" for="affiliationWomen"> 川崎 </label>
</div>
  <h3 style="color: red;" v-show="error">全ての項目に情報を書いてください</h3>
  <button type="button" class="btn btn-primary" @click="updateInfo">更新する</button>
</template>
<style>
.title {
  text-align: center;
}
.aicon-image{
  width: 100px;
  height: 100px;
  border-radius: 50px;
}
</style>
