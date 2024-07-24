<script setup lang="ts">
import { ref as Vueref, computed, onMounted, watchEffect } from 'vue'
import { type User } from 'firebase/auth'
import { getDatabase, ref as Fireref, child, get, onValue, set, remove } from 'firebase/database'
interface Porps {
  currentUser: User | null
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
}
const emit = defineEmits<Emits>()
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
</script>
<template>
  <button v-on:click="Pushtoggle()" class="Tbutton">
    <i class="bi bi-caret-down-fill" v-show="!IsToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="IsToggle"></i>
    <h2>自分の情報更新</h2>
  </button>
  <article v-show="IsToggle">
    <h2>名前:{{ currentUser?.displayName }}</h2>
    <h2>email:{{ currentUser?.email }}</h2>
    <h2>役職:{{ Myrole }}</h2>
    <h2>住所:{{ Myplace }}</h2>
  </article>
</template>
<style>
.Tbutton {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}
</style>
