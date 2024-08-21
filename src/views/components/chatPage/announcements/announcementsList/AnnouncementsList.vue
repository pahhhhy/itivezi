<script setup lang="ts">
import {ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import AnnouncementsListElement from "@/views/components/chatPage/announcements/announcementsList/AnnouncementsListElement.vue";

// お知らせのリファレンス
const announcementsRef = fireRef(getDatabase(), 'testAnnouncements/announcements')
// 取得したお知らせ一覧
const announcements = ref([])

// お知らせ一覧を非同期で取得する処理
onValue(announcementsRef, (snapshot) => {
  announcements.value = Object.values(snapshot.val())
})


</script>
<template>
  <div>
    <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
      <h5>お知らせ一覧(仮)</h5>
      <AnnouncementsListElement v-for="announce in announcements" :key="announce" :announce/>
    </div>
  </div>
</template>
