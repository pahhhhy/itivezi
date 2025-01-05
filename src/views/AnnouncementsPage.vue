<script setup lang="ts">

import AnnouncementsListPage from "@/views/AnnouncementsListPage.vue";
import {useAuthData} from "@/utils/auth";
import {useRoute} from "vue-router";
import {onMounted, ref, watch} from "vue";
import AnnouncementDetailPage from "@/views/AnnouncementDetailPage.vue";
import {getDatabase, onValue, ref as fireRef} from "firebase/database";
import type {Category} from "@/types/announcement/categories";
import LoadingSpinner from "@/views/components/common/LoadingSpinner.vue";
import AnnouncementsDataWrapper from "@/views/components/announcementPage/AnnouncementsDataWrapper.vue";
import {useAnnouncementsStore} from "@/stores/announcements";

const {user, role} = useAuthData()
const route = useRoute();
const currentAnnounceId = ref<string | null>(route.params["announceId"]?.toString() ?? null)
watch(() => route.params, (params) => { // ページ遷移時にannounceIdを取得
  currentAnnounceId.value = params["announceId"]?.toString() ?? null
})


// カテゴリーのリファレンス
const categoriesRef = fireRef(getDatabase(), 'testAnnouncements/categories');
const announcementsStore = useAnnouncementsStore();

onMounted(() => { // カテゴリー一覧を他の子コンポーネントに先んじて取得
  onValue(categoriesRef, (snapshot) => {
    if (!snapshot.exists()) {
      const defaultData: Category = {
        categoryId: '',
        categoryName: '',
        announcementCount: 0,
        announces: {}
      }
      announcementsStore.categories = [defaultData]
    } else {
      announcementsStore.categories = Object.values(snapshot.val())
    }
  })
})


</script>

<template>
  <div class="announcement-page" v-if="user && role">
    <div v-if="announcementsStore.categories"> <!-- カテゴリーが取得できたら表示 -->
      <AnnouncementsDataWrapper>
        <AnnouncementsListPage v-if="!currentAnnounceId" :role="role"/>
        <AnnouncementDetailPage v-else :announceId="currentAnnounceId"/>
      </AnnouncementsDataWrapper>
    </div>
    <div v-else>
      <LoadingSpinner/>
    </div>
  </div>
  <div v-else-if="user === null">
    <p>ログインしてください</p>
  </div>
</template>
