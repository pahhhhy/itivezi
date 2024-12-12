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
  enum CheckList{
    Name="name",
    Gender="gender",
    Role="role",
    place="place",
    phoneNumber="number",
    affiliation="affilltion"
  }
const fireUseStore=usefireUserStore()
const iconStore = (useIconStore())
const userData = ref<Usertables>(fireUseStore.myUserData)
  const Checklist = ref(
  Object.values(CheckList).reduce((acc, key) => {
    acc[key] = false; // 初期値を false に設定
    return acc;
  }, {} as Record<string, boolean>)
);
const auth = getAuth();
const userStore=useUserStore()
const currentUser = ref<User|null>(userStore.currentUser);
const inputNumber = ref<string>("")
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
// Firebase Storageに画像をアップロードし、Firebase Authのプロフィールを更新
const uploadImage = async () => {
  if (currentUser.value) {
    console.log("uploadimgage"+selectedImage.value+":::"+currentUser.value)
    await iconStore.uploadImage(selectedImage.value, currentUser.value);
    currentUser.value.reload()
    if(currentUser.value.photoURL)
    userProfileImage.value=currentUser.value.photoURL
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
    userData.value.phoneNumber != 0&&
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
    if(userData.value.role == '') Checklist.value[CheckList.Role]=true
    if(userData.value.place == '') Checklist.value[CheckList.place]=true
    if(userData.value.phoneNumber == 0) Checklist.value[CheckList.phoneNumber]=true
    if(userData.value.gender == '') Checklist.value[CheckList.Gender]=true
    if(userData.value.affiliation.length == 0) Checklist.value[CheckList.affiliation]=true
  }
}
// ファイルが選択されたときにファイルデータを保持
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedImage.value = target.files[0];
    await uploadImage()
  }
};
//電話番号の最初の0をうけとるために一度stringで受け取りnumberにする
//追記：数字しかはいらないようにフォーマットを入れた
function stringToNumber(event:Event){
  const inputElement = event.target as HTMLInputElement;
  const newValue = inputElement.value.replace(/\D/g, '');
  userData.value.phoneNumber=parseInt(inputNumber.value)
  inputNumber.value=newValue
  if(Checklist.value[CheckList.phoneNumber]){Checklist.value[CheckList.phoneNumber]=false}
  return
}
//エラーがでてから何かを入力をしたらそれを消すようにする
function inputdata(mode:CheckList){
  if(mode==CheckList.Role&&Checklist.value[CheckList.Role]){Checklist.value[CheckList.Role]=false}
  if(mode==CheckList.affiliation&&Checklist.value[CheckList.affiliation]){Checklist.value[CheckList.affiliation]=false}
  if(mode==CheckList.Gender&&Checklist.value[CheckList.Gender]){Checklist.value[CheckList.Gender]=false}
  if(mode==CheckList.place&&Checklist.value[CheckList.place]){Checklist.value[CheckList.place]=false}
  return
}
</script>

<template>
  <article class="addinfo-card">
    <div class="title">
      <h1>追加情報</h1>
    </div>
    <div class="mb-3">
      <h4 for="exampleFormControlInput1" class="form-label">名前</h4>
      <input
        type="text"
        class="form-control"
        id="exampleFormControlInput1"
        placeholder="name"
        v-model="userData.name"
      />
    </div>
    <div>
      <h4>アイコン画像</h4>
      <div class="imgform">
        <div class="changeimg_button">
          <label for="imginput"> 画像の挿入</label>
          <input type="file" @change="handleFileChange"  class="hidden-input" id="imginput" />
        </div>
        <div  class="uproad_image">
          <img v-if="userProfileImage&&userProfileImage!='' " :src="userProfileImage" alt="Uploaded Image" />
          <img src="../assets/Noimage.jpeg" alt="何もない" v-if="userProfileImage==''">
        </div>
      </div>
    </div>
    <h4>性別</h4>
    <select class="form-select-addinfo" aria-label="Default select example" v-model="userData.gender" v-on:change="inputdata(CheckList.Gender)">
      <option selected disabled value=""> 選択してください</option>
      <option value="men">男性</option>
      <option value="women">女性</option>
      <option value="other">その他</option>
    </select>
    <p class="errorMes" v-show="Checklist[CheckList.Gender]">性別を選択してください</p>
    <h4>役職</h4>
    <select class="form-select-addinfo" aria-label="Default select example" v-model="userData.role" v-on:change="inputdata(CheckList.Role)">
      <option selected disabled value=""> 選択してください</option>
      <option value="農家">農家</option>
      <option value="飲食店">飲食店</option>
    </select>
    <p class="errorMes" v-show="Checklist[CheckList.Role]">役職を選択してください</p>
    <div class="mb-3">
      <h4 for="exampleFormControlInput1" class="form-label">住所</h4>
      <input
        type="text"
        class="form-control"
        id="exampleFormControlInput1"
        placeholder="住所"
        v-model="userData.place"
        v-on:change="inputdata(CheckList.place)"
      />
    </div>
    <p class="errorMes" v-show="Checklist[CheckList.place]">住所を入力してください</p>
    <div class="mb-3">
      <h4 for="exampleFormControlInput1" class="form-label">電話番号</h4>
      <input
        type="text"
        class="form-control"
        id="exampleFormControlInput1"
        placeholder="電話番号 ハイフンなし"
        v-model="inputNumber"
        v-on:change="stringToNumber"
      />
    </div>
    <p class="errorMes" v-show="Checklist[CheckList.phoneNumber]">電話番号を入力してください</p>
    <h4>所属</h4>
  <div class="form-check">
    <input
      class="form-check-input"
      type="checkbox"
      value="室根"
      v-model="userData.affiliation"
      id="affiliationMen"
      v-on:change="inputdata(CheckList.affiliation)"
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
      v-on:change="inputdata(CheckList.affiliation)"
    />
    <label class="form-check-label" for="affiliationWomen"> 川崎 </label>
  </div>
    <p class="errorMes" v-show="Checklist[CheckList.affiliation]">所属を選択してください</p>
    <button type="button" class="btn btn-primary" @click="updateInfo">更新する</button>
  </article>
  
</template>
<style>
.title {
  margin-bottom: 15px;
  border-bottom: 1px solid var(--line-color);
}
.title h1{
  text-align: left;
  font-size: 30px;
}
.errorMes{
  color: red;
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
.form-select-addinfo{
  width: 200px;
  padding: 5px 10px;
  border-radius: 5px;
  margin: 5px 0;
}
@media (max-width: 575.98px) { 
  .addinfo-card{
    width: 340px!important;
  }
}
</style>
