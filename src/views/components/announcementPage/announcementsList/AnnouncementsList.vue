<script setup lang="ts">
import AnnouncementsListElement
  from '@/views/components/announcementPage/announcementsList/AnnouncementsListElement.vue'
import {useAnnouncementsStore} from "@/stores/announcements";
import {useUserDataStore} from "@/stores/userPublicData";
import SlideMenu from "@/views/components/common/SlideMenu.vue";
import {computed, inject, onMounted, ref} from "vue";
import type {Category} from "@/types/announcement/categories";
import type {Announcement} from "@/types/announcement/announcement";


const announcementsStore = useAnnouncementsStore()
const userDataStore = useUserDataStore()
const maxShowAnnounceCountByCategory = 3

const selectedCategory = ref<Category | null | true>(null)
onMounted(() => {
  announcementsStore.categorize()
})

// 最低でも1つの記事があるカテゴリの配列
const categoriesWithAnnounces = computed(() => {
  return Object.keys(announcementsStore.categorizedAnnouncements)
      .filter((categoryName) => Object.keys(announcementsStore.categorizedAnnouncements[categoryName]).length > 0)
      .map((categoryName) => announcementsStore.categories.find((category) => category.categoryName === categoryName)!)
})


const announcesByCategory = computed<Announcement[]>(() => {

  if (selectedCategory.value === true) {
    return announcementsStore.announcements
  }
  if (!selectedCategory.value) {
    return []
  }
  return Object.values(announcementsStore.categorizedAnnouncements[selectedCategory.value.categoryName])
})

const getCategoryNameById = computed<(categoryId: string) => string>(() => (categoryId: string) => {
  return announcementsStore.categories.find((category) => category.categoryId === categoryId)?.categoryName ?? ''
})

const checkExistsMoreAnnounceByCat = inject('checkExistsMoreAnnounceByCat') as (categoryId: string) => boolean
const getMoreAnnouncementByCat = inject('getMoreAnnounceByCat') as (categoryId: string) => void

const canGetMoreAnnouncementByCategory = computed(() => {
  if (selectedCategory.value === true) {
    return announcementsStore.announcements.length > maxShowAnnounceCountByCategory
  }
  if (!selectedCategory.value) {
    return false
  }
  return checkExistsMoreAnnounceByCat(selectedCategory.value.categoryId)
})
</script>
<template>
  <div v-if="announcementsStore.announcements && userDataStore.usersPublicData" class="announcements-list-wrapper">
    <SlideMenu
        :title="selectedCategory === true ? '最近の投稿' : selectedCategory?.categoryName ?? ''"
        v-if="selectedCategory"
        @close="selectedCategory = null"
    >
      <AnnouncementsListElement
          v-for="announce in announcesByCategory"
          :key="announce.announceId"
          :announce="announce"
          :category-name="getCategoryNameById(announce.categoryId)"
          :author-display-name="userDataStore.usersPublicData[announce.userId]?.userName ?? '不明なユーザー'"
      />
      <!-- ここではtrueは特別な意味を持つので簡素化できない -->
      <button
          class="more-button"
          v-if="canGetMoreAnnouncementByCategory && selectedCategory !== true"
          @click="getMoreAnnouncementByCat(selectedCategory  ? selectedCategory.categoryId : '')"
      >さらに取得</button>
    </SlideMenu>
    <div class="category-wrapper">
      <h6 @click="selectedCategory = true">
        <span>最近の投稿</span>
        <span><span style="font-size: .8em">もっと見る</span><IconRightArrow/></span>
      </h6>

      <AnnouncementsListElement
          v-for="announce in announcementsStore.announcements.slice(0, maxShowAnnounceCountByCategory)"
          :key="announce.announceId"
          :announce="announce"
          :category-name="getCategoryNameById(announce.categoryId)"
          :author-display-name="userDataStore.usersPublicData[announce.userId]?.userName ?? '不明なユーザー'"
      />
    </div>

    <!--      属している投稿が一つもないカテゴリは表示しない-->
    <!--    カテゴリごと-->
    <div
        v-for="category in categoriesWithAnnounces"
        :key="category ? category.categoryId : 'new'"
        class="category-wrapper"
    >
      <h6 @click="selectedCategory = category">
        <span>{{ category?.categoryName ?? 'カテゴリ未分類' }}</span>
        <span><span style="font-size: .8em">もっと見る</span><IconRightArrow/></span>
      </h6>
      <AnnouncementsListElement
          v-for="announce in Object.values(announcementsStore.categorizedAnnouncements[(category && category.categoryName) ?? '未分類']).slice(0, maxShowAnnounceCountByCategory)"
          :key="announce.announceId"
          :announce="announce"
          :categoryName="category?.categoryName ?? '未分類'"
          :authorDisplayName="userDataStore.usersPublicData[announce.userId]?.userName ?? '不明なユーザー'"
      />
    </div>
  </div>
  <p v-else>投稿がありません。</p>
</template>

<style scoped>
.announcements-list-wrapper {
  margin: 30px;
}

.more-button {
  margin: 10px auto;
  padding: 5px 10px;
  border-radius: 5px;
  background: var(--acsent-color);
  color: white;
  border: none;
  cursor: pointer;
}

h6 {
  padding: 5px 5px 5px 10px;
  color: #434343;
  border-bottom: 1px solid currentColor;
  width: calc(100% - 12px);
  position: relative;
  word-break: break-all;
  font-size: 1.3em;
  cursor: pointer;
  display: flex;
  justify-content: space-between;

}


.category-wrapper {
  margin: 10px 0;
  background: white;
  border-radius: 10px;
  padding: 5px 2em;

}


</style>
