<script setup lang="ts">
import { ref,  watchEffect } from 'vue'
import {  updateProfile, type User } from 'firebase/auth'
import { getDatabase, ref as fireRef,  onValue, update } from 'firebase/database'
interface Props {
  currentUser: User | null
}

const props = defineProps<Props>()
const isToggle = ref<boolean>(false)
function pushToggle() {
  isToggle.value = !isToggle.value;
}
const myData = ref<any>()
const myRole = ref<string>('')
const myPlace = ref<string>('')
const myGender = ref<string>('')
const myNumber = ref<number>(0)
const upName = ref<string>('')
const upPlace = ref<string>('')
const upRole = ref<string>(myRole.value)
watchEffect(() => {
  // currentUserがnullでない場合のみデータを読み込む
  if (props.currentUser) {
    const countRef = fireRef(getDatabase(), `testUser/${props.currentUser.uid}`)
    onValue(countRef, (snapshot) => {
      myData.value = snapshot.val()
      myRole.value = myData.value.role
      myPlace.value = myData.value.place
      myGender.value = myData.value.Gender
      myNumber.value = myData.value.PhoneNumber
    })
  }
})
function updateDisName(user: User, name: string) {
  updateProfile(user, { displayName: name })
    .then(() => {
      // 成功時の処理
      
    })
}
const elementsBool = ref<boolean[]>(new Array(4).fill(false))
function pushUpdate(element: string, bool: boolean) {
  if (element == '名前') {
    elementsBool.value[0] = bool
    if (!bool) {
      if (upName.value == '') {
        return
      }
      if (props.currentUser != null) {
        updateDisName(props.currentUser, upName.value)
        writeUserdata(props.currentUser.uid, { name: upName.value })
      }
    }
  }
  if (element == '役職') {
    elementsBool.value[2] = bool
    if (!bool) {
      if (props.currentUser != null) writeUserdata(props.currentUser.uid, { role: upRole.value })
    }
  }
  if (element == '住所') {
    elementsBool.value[3] = bool
    if (!bool) {
      if (upPlace.value == '') {
        return
      }
      if (props.currentUser != null) writeUserdata(props.currentUser.uid, { place: upPlace.value })
    }
  }
}
function writeUserdata(
  uid: string,
  data: { role?: string; place?: string; PhoneNumber?: number; Gender?: string; name?: string }
) {
  const db = getDatabase()
  const updates: { [key: string]: any } = {}
  // roleが存在する場合、roleをアップデートする
  if (data.role !== undefined) {
    updates['role'] = data.role
  }
  if (data.place !== undefined) {
    updates['place'] = data.place
  }
  if (data.PhoneNumber !== undefined) {
    updates['PhoneNumber'] = data.PhoneNumber
  }
  if (data.Gender !== undefined) {
    updates['Gender'] = data.Gender
  }
  if (data.name !== undefined) {
    updates['name'] = data.name
  }

  // いずれかのデータがあればデータベースに書き込む
  if (Object.keys(updates).length > 0) {
    update(fireRef(db, 'testUser/' + uid), updates)
  }
}
</script>
<template>
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の情報更新</h2>
  </button>
  <article v-show="isToggle">
    <div class="UP_elements" v-show="!elementsBool[0]">
      <h2>名前:{{ currentUser?.displayName }}</h2>
      <button v-on:click="pushUpdate('名前', true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="elementsBool[0]">
      <input
        class="form-control"
        type="text"
        placeholder="名前"
        aria-label="default input example"
        v-model="upName"
      />
      <button v-on:click="pushUpdate('名前', false)" class="btn btn-primary">更新する</button>
    </div>
    <h2>性別:{{ myGender }}</h2>
    <h2>電話番号:{{ myNumber }}</h2>
    <h2>email:{{ currentUser?.email }}</h2>
    <div class="UP_elements" v-show="!elementsBool[2]">
      <h2>役職:{{ myRole }}</h2>
      <button
        v-on:click="pushUpdate('役職', true)"
        class="btn btn-primary"
        v-if="myRole != '管理者'"
      >
        更新する
      </button>
    </div>
    <div class="UP_radio" v-show="elementsBool[2]">
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          value="農家"
          name="flexRadioDefault"
          v-model="upRole"
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
          v-model="upRole"
        />
        <label class="form-check-label" for="flexRadioDefault2"> 飲食店 </label>
      </div>
      <button v-on:click="pushUpdate('役職', false)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="!elementsBool[3]">
      <h2>住所:{{ myPlace }}</h2>
      <button v-on:click="pushUpdate('住所', true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="elementsBool[3]">
      <input
        class="form-control"
        type="text"
        placeholder="住所"
        aria-label="default input example"
        v-model="upPlace"
      />
      <button v-on:click="pushUpdate('住所', false)" class="btn btn-primary">更新する</button>
    </div>
  </article>
</template>
<style>
.toggle-button {
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
