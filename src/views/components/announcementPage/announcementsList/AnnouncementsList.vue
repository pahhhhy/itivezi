<script setup lang="ts">
import {ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import AnnouncementsListElement
  from "@/views/components/announcementPage/announcementsList/AnnouncementsListElement.vue";
import type { Category, CategorizedAnnouncements } from '@/types/announcement/categories'
import {categorizeAnnouncements} from "@/utils/announcement/announcementCategories";

interface Props {
  categories: Category
}

const {categories} = defineProps<Props>()



const db = getDatabase()
// お知らせのリファレンス
const announcementsRef = fireRef(db, 'testAnnouncements/announcements')
// カテゴリーのリファレンス
const categoriesRef = fireRef(db, 'testAnnouncements/categories')
// 取得したお知らせ一覧
const announcements = ref()
const nestedAnnouncements = ref<CategorizedAnnouncements>({})

// お知らせ一覧を非同期で取得する処理
onValue(announcementsRef, (snapshot) => {
  if (!snapshot.exists()) {
    return
  }

  announcements.value = Object.values(snapshot.val())

  nestedAnnouncements.value = categorizeAnnouncements(Object.values(categories), Object.values(snapshot.val()))
})


</script>
<template>
  <div>
    <h5>お知らせ一覧(仮)</h5>
    <div v-if="announcements" style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
<!--      属している記事が一つもないカテゴリは表示しない-->
      <div v-for="categoryNames in Object.keys(nestedAnnouncements).filter(categoryName => Object.keys(nestedAnnouncements[categoryName]).length > 0)" :key="categoryNames">
        <h6>{{ categoryNames }}</h6>
        <AnnouncementsListElement v-for="announce in nestedAnnouncements[categoryNames]" :key="announce.announceId" :announce/>
      </div>
    </div>
    <p v-else>お知らせがありません。</p>
  </div>
</template>
