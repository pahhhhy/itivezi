<script setup lang="ts">
import {ref} from 'vue'
import {getDatabase, onValue, push, ref as fireRef} from 'firebase/database'

// firebaseのデータベースからデータを取得する
function readData(element: string) {
  const countRef = fireRef(getDatabase(), 'test/' + element)
  const data = ref<any>(null)
  onValue(countRef, (snapshot) => {
    data.value = snapshot.val()
  })
  return data
}


const message = ref<string>('')

const announcementsRef = fireRef(getDatabase(), 'testAnnouncements/')
function sendAnnouncement() {

  const db = getDatabase()
  push(announcementsRef, {
    message: message.value
  }).then(() => {
  }).catch((error) => {
    console.error('注文の保存中にエラーが発生しました:', error)
  })
  console.log(message.value)
  message.value = ''
}


const announcements = ref([])
onValue(announcementsRef, (snapshot) => {
  console.log(snapshot.val())
  announcements.value = Object.values(snapshot.val())
  console.log(announcements.value)
})



</script>
<template>
  <div>
    <h1>最新のお知らせ</h1>

    <input type="text" v-model="message"/>
    <button @click="sendAnnouncement">送信</button>
    <p> {{ message }}</p>
    <h1>お知らせ一覧</h1>
<!--    <div v-for="announcement in announcements" :key="announcement.message">-->
<!--      <p>{{ announcement.message }}</p>-->
    <p >{{ announcements }}</p>
  </div>
</template>