<script setup lang="ts">
import { ref as Vueref, computed, onMounted, watchEffect } from 'vue'
import { getAuth, onAuthStateChanged, updateProfile, type User } from 'firebase/auth'
import { getDatabase, ref as Fireref, child, get, onValue, set, remove } from 'firebase/database'
interface Porps {
  currentUser: User | null
}

const porps = defineProps<Porps>()
const IsToggle = Vueref<boolean>(false)

console.log('USer' + porps.currentUser)
function Pushtoggle() {
  if (IsToggle.value) IsToggle.value = false
  else IsToggle.value = true
  console.log(IsToggle.value)
}
const MyData = Vueref<any>()
const Myrole = Vueref<string>('')
const Myplace = Vueref<string>('')
watchEffect(() => {
  // currentUserがnullでない場合のみデータを読み込む
  if (porps.currentUser) {
    const countRef = Fireref(getDatabase(), `testUser/${porps.currentUser.uid}`)
    onValue(countRef, (snapshot) => {
      MyData.value = snapshot.val()
      Myrole.value = MyData.value.role
      Myplace.value = MyData.value.place
    })
  }
})
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
const elementsBool = Vueref<boolean[]>(new Array(4).fill(false))
function PushUpdate(element: string, Bool: boolean) {
  if (element == '名前') {
    elementsBool.value[0] = Bool
    if (Bool == false) {
      if (Upname.value == '') {
        console.log('何もないぞ')
        return
      }
      if (porps.currentUser != null) updateDisname(porps.currentUser, Upname.value)
    }
  }
  if (element == '役職') {
    elementsBool.value[2] = Bool
    if (Bool == false) {
      if (porps.currentUser != null)
        writeUserdata(porps.currentUser.uid, Uprole.value, Myplace.value)
    }
  }
  if (element == '住所') {
    elementsBool.value[3] = Bool
    if (Bool == false) {
      if (Upplace.value == '') {
        console.log('お前に住所はないんか')
        return
      }
      if (porps.currentUser != null)
        writeUserdata(porps.currentUser.uid, Myrole.value, Upplace.value)
    }
  }
}
//指定したデータを書き込むようにしている。Vegeに該当の野菜
function writeUserdata(uid: string, role: string, place: string) {
  const db = getDatabase()

  set(Fireref(db, 'testUser/' + uid), {
    role: role,
    place: place
  })
}
const Upname = Vueref<string>('')
const Upplace = Vueref<string>('')
const Uprole = Vueref<string>(Myrole.value)
</script>
<template>
  <button v-on:click="Pushtoggle()" class="Tbutton">
    <i class="bi bi-caret-down-fill" v-show="!IsToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="IsToggle"></i>
    <h2>自分の情報更新</h2>
  </button>
  <article v-show="IsToggle">
    <div class="UP_elements" v-show="!elementsBool[0]">
      <h2>名前:{{ currentUser?.displayName }}</h2>
      <button v-on:click="PushUpdate('名前', true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="elementsBool[0]">
      <input
        class="form-control"
        type="text"
        placeholder="名前"
        aria-label="default input example"
        v-model="Upname"
      />
      <button v-on:click="PushUpdate('名前', false)" class="btn btn-primary">更新する</button>
    </div>

    <h2>email:{{ currentUser?.email }}</h2>
    <div class="UP_elements" v-show="!elementsBool[2]">
      <h2>役職:{{ Myrole }}</h2>
      <button v-on:click="PushUpdate('役職', true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_radio" v-show="elementsBool[2]">
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          value="農家"
          name="flexRadioDefault"
          v-model="Uprole"
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
          v-model="Uprole"
        />
        <label class="form-check-label" for="flexRadioDefault2"> 飲食店 </label>
      </div>
      <button v-on:click="PushUpdate('役職', false)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="!elementsBool[3]">
      <h2>住所:{{ Myplace }}</h2>
      <button v-on:click="PushUpdate('住所', true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="elementsBool[3]">
      <input
        class="form-control"
        type="text"
        placeholder="住所"
        aria-label="default input example"
        v-model="Upplace"
      />
      <button v-on:click="PushUpdate('住所', false)" class="btn btn-primary">更新する</button>
    </div>
  </article>
</template>
<style>
.Tbutton {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}
.UP_elements {
  display: flex;
  width: 30%;
  height: 50px;
}
</style>
