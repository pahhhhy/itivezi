<script setup lang="ts">
import type { Announcement } from '@/types/announcement/announcement'
import { formatServerTimestamp } from '@/utils/database'

interface Props {
  announce: Announcement,
  categoryName: string
}

const { announce, categoryName } = defineProps<Props>()
</script>
<template>
  <router-link :to="'/announcements/' + announce['announceId']" class="card">
    <p>{{categoryName}}</p>
    <p>{{ announce['title'] }}</p>
    <p>{{ announce['userId'] }}</p>
    <p>
      {{ formatServerTimestamp(announce.createdAt)
      }}<span v-if="announce.updatedAt">({{ formatServerTimestamp(announce.updatedAt) }}更新)</span>
    </p>
  </router-link>
</template>
<style scoped>
.card {
}
</style>