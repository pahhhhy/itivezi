<script setup lang="ts">
import { ref, watch } from 'vue'
import { getAuth, updateProfile, type User } from 'firebase/auth'
import router from '@/router'
import { usefireUserStore } from '@/stores/fireUserdata'
import {useIconStore}from "../stores/icon"
import { useUserStore } from '@/stores/userData';

interface Usertables{
    affiliation:String[]
    gender:string
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
    None=""
  }
const fireUseStore=usefireUserStore()
const iconStore = (useIconStore())
const userData = ref<Usertables>(fireUseStore.myUserData)
const error=ref<boolean>(false)
const auth = getAuth();
const userStore=useUserStore()
const currentUser = ref<User|null>(userStore.currentUser);
// 画像のファイルデータを保持する
const file = ref<File | null>(null);
// 選択された画像とプロフィール画像を格納する変数
const selectedImage = ref<any>(null);
const userProfileImage = ref(auth.currentUser?.photoURL || '');
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
  if(currentUser.value){
    fireUseStore.roadFireUseData(currentUser.value.uid)
  }
  userProfileImage.value=auth.currentUser?.photoURL || ''
  if(currentUser.value?.displayName)
  userData.value.name=currentUser.value?.displayName
});
watch(() => fireUseStore.myUserData, (newUser) => {
  userData.value = newUser;
});

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
function updateDisName(user: User, name: string) {
  updateProfile(user, { displayName: name })
    .then(() => {
      // 成功時の処理
      
    })
}
//一度にすべての入力を元に更新する
async function updateInfo() {
  if (
    userData.value.role != '' &&
    userData.value.place!= '' &&
    userData.value.phoneNumber != undefined &&
    userData.value.gender != ''&&
    userData.value.name!=""&&
    userData.value.affiliation.length !=0&&
    currentUser.value?.photoURL!=null
  ) {
    if (currentUser.value&&currentUser.value.email) {
      updateDisName(currentUser.value, userData.value.name)
      userData.value.email=currentUser.value.email
      await fireUseStore.update(userData.value,currentUser.value.uid)
      await fireUseStore.roadFireUseData(currentUser.value.uid)
      router.push('/')
    }
  } else{
    error.value=true
  }
}
// ファイルが選択されたときにファイルデータを保持
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    await uploadImage()
  }
};
</script>

<template>
  <article class="addinfo-card">
    <div class="title">
      <h1>追加情報</h1>
    </div>
    <div class="mb-3">
      <label for="exampleFormControlInput1" class="form-label">名前</label>
      <input
        type="text"
        class="form-control"
        id="exampleFormControlInput1"
        placeholder="name"
        v-model="userData.name"
      />
    </div>
    <div>
      <div class="imgform">
        <div class="changeimg_button">
          <label for="imginput"> 画像の挿入</label>
          <input type="file" @change="handleFileChange"  class="hidden-input" id="imginput" />
        </div>
        <div  class="uproad_image">
          <img v-if="userProfileImage&&userProfileImage!='' " :src="userProfileImage" alt="Uploaded Image" />
          <img src="../../../assets/Noimage.jpeg" alt="何もない" v-if="userProfileImage==''">
        </div>
      </div>
    </div>
    <h3>性別</h3>
    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        value="men"
        name="gender"
        v-model="userData.gender"
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
        v-model="userData.gender"
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
        v-model="userData.gender"
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
        v-model="userData.role"
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
        v-model="userData.role"
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
        v-model="userData.place"
      />
    </div>
    <div class="mb-3">
      <label for="exampleFormControlInput1" class="form-label">電話番号</label>
      <input
        type="number"
        class="form-control"
        id="exampleFormControlInput1"
        placeholder="電話番号 ハイフンなし"
        v-model="userData.phoneNumber"
      />
    </div>
    <h3>所属</h3>
  <div class="form-check">
    <input
      class="form-check-input"
      type="checkbox"
      value="室根"
      v-model="userData.affiliation"
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
      v-model="userData.affiliation"
    />
    <label class="form-check-label" for="affiliationWomen"> 川崎 </label>
  </div>
    <h3 style="color: red;" v-show="error">全ての項目に情報を書いてください</h3>
    <button type="button" class="btn btn-primary" @click="updateInfo">更新する</button>
  </article>
  
</template>
<style>
.title {
  
  border-bottom: 1px solid var(--line-color);
}
.title h1{
  text-align: left;
  font-size: 30px;
}
.addinfo-card{
  width: 512px!important;
  margin:  0 auto ;
  margin-top: 20px;
  padding: 20px 20px;
  background-color: white;
  border-radius: 10px;
}
.aicon-image{
  width: 100px;
  height: 100px;
  border-radius: 50px;
}
.imgform{
  display: flex;
  width: 245px;
}
.uproad_image{
  margin-left: 10px;
  width: 100px;
  height: 50px;
}
.uproad_image img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.hidden-input {
  display: none;
}
.changeimg_button {
  display: flex;
  align-items: center;
}
.changeimg_button label{
  width: 100px;
  height: 30px;
  padding: 3px;
  background-color: var(--line-color);
  border-radius: 5px;
  text-align: center;
}
</style>
