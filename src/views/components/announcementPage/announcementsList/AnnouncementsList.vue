<script setup lang="ts">
import {ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import AnnouncementsListElement
  from "@/views/components/announcementPage/announcementsList/AnnouncementsListElement.vue";
import type {Category} from "@/types/announcement/categories";
import {reorganizeAnnouncements} from "@/utils/announcement/announcementCategories";

interface Props {
  categories: Category
}

const {categories} = defineProps<Props>()

console.log("categoriesssssssssss", categories)


const db = getDatabase()
// お知らせのリファレンス
const announcementsRef = fireRef(db, 'testAnnouncements/announcements')
// カテゴリーのリファレンス
const categoriesRef = fireRef(db, 'testAnnouncements/categories')
// 取得したお知らせ一覧
const announcements = ref()
const nestedAnnouncements = ref([])

// お知らせ一覧を非同期で取得する処理
onValue(announcementsRef, (snapshot) => {
  if (!snapshot.exists()) {
    return
  }

  announcements.value = Object.values(snapshot.val())
  console.log("nestmae", categories)
  nestedAnnouncements.value = reorganizeAnnouncements(Object.values(categories), Object.values(snapshot.val()))
  console.log(nestedAnnouncements.value)
})


</script>
<template>
  <div>
    <h5>お知らせ一覧(仮)</h5>

    <div v-if="announcements" style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
      <div v-for="categoryNames in Object.keys(nestedAnnouncements)" :key="categoryNames">
        <h6>{{ categoryNames }}</h6>
        <AnnouncementsListElement v-for="announce in nestedAnnouncements[categoryNames]" :key="announce" :announce/>
      </div>
      <AnnouncementsListElement v-for="announce in announcements" :key="announce" :announce/>
    </div>
    <p v-else>お知らせがありません。</p>
  </div>
</template>
