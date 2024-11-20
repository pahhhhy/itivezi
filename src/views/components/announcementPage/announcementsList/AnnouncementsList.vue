<script setup lang="ts">
import { ref } from 'vue'
import { getDatabase, onValue, ref as fireRef } from 'firebase/database'
import AnnouncementsListElement from '@/views/components/announcementPage/announcementsList/AnnouncementsListElement.vue'
import type { CategorizedAnnouncements, Category } from '@/types/announcement/categories'
import { categorizeAnnouncements } from '@/utils/announcement/announcementCategories'

interface Props {
  categories: Category
}

const { categories } = defineProps<Props>()

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

  nestedAnnouncements.value = categorizeAnnouncements(
    Object.values(categories),
    Object.values(snapshot.val())
  )
})
</script>
<template>
  <div v-if="announcements" class="categories-wrapper">
    <!--      属している記事が一つもないカテゴリは表示しない-->
    <div
      v-for="categoryNames in Object.keys(nestedAnnouncements).filter(
        (categoryName) => Object.keys(nestedAnnouncements[categoryName]).length > 0
      )"
      :key="categoryNames"
    >
      <p>{{categories}}</p>
      <h6>{{ categoryNames }}</h6>
      <AnnouncementsListElement
        v-for="announce in nestedAnnouncements[categoryNames]"
        :key="announce.announceId"
        :announce
        :category-name=""
      />
    </div>
  </div>
  <p v-else>お知らせがありません。</p>
</template>

<style scoped>
.categories-wrapper {
  margin: 30px;
}

h6 {
  margin: 10px 0 4px;
  padding: 5px 48px 5px 10px;
  color: #434343;
  border-bottom: 1px solid currentColor;
  width: calc(100% - 12px);
  position: relative;
  word-break: break-all;
}

h6::after {
  content: '>';
  position: absolute;
  height: 24px;
  right: 12px;
  top: 50%;
  font-size: 24px;
  line-height: 0;
}
</style>