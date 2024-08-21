<script setup lang="ts">
import {ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import {useRoute} from "vue-router";
import type {Announcement} from "@/types/chatpage/announcement";
import {formatServerTimestamp} from "../utils/database";

const announcement = ref<Announcement>();
const route = useRoute()

// このページのannounceId
const announceId = route.params.announceId
// このページで表示する記事
const announcementRef = fireRef(getDatabase(), 'testAnnouncements/announcements/' + announceId)
// お知らせを非同期で取得
onValue(announcementRef, (snapshot) => {
  announcement.value = snapshot.val()
})


</script>
<template>
  <div>
    <div v-if="announcement" style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
      <h1>{{ announcement.title }}</h1>
      <p>{{ announcement.content }}</p>
      <p>{{ formatServerTimestamp(announcement.createdAt)}}</p>
    </div>
  </div>
</template>