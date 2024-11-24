<script setup lang="ts">
import AnnouncementsList from '@/views/components/announcementPage/announcementsList/AnnouncementsList.vue'
import { useAuthData } from '@/utils/auth'
import PostAnnouncementForm from '@/views/components/announcementPage/postAnnouncementForm.vue'
import CategoriesManager from '@/views/components/announcementPage/categoriesManager.vue'
import { getDatabase, onValue, ref as fireRef } from 'firebase/database'
import { onMounted, ref } from 'vue'
import type { Category } from '@/types/announcement/categories'

const { role } = useAuthData()

// カテゴリーのリファレンス
const categoriesRef = fireRef(getDatabase(), 'testAnnouncements/categories')
const categories = ref()

onMounted(() => {
  // カテゴリー一覧を非同期で取得する処理
  onValue(categoriesRef, (snapshot) => {
    if (!snapshot.exists()) {
      const defaultData: Category = {
        categoryId: '',
        categoryName: '',
        announcementCount: 0,
        announces: {}
      }
      categories.value = [defaultData]
    } else {
      categories.value = Object.values(snapshot.val())
    }
  })
})
</script>

<template>
  <div class="announcements" v-if="categories !== undefined">
    <PostAnnouncementForm :categories="categories" v-if="role === '管理者'" />
    <AnnouncementsList :categories="categories" />
  </div>
</template>
