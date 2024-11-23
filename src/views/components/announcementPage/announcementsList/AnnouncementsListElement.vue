<script setup lang="ts">
import type {Announcement} from '@/types/announcement/announcement'
import {formatServerTimestamp} from '@/utils/database'

interface Props {
  announce: Announcement,
  categoryName: string,
  authorDisplayName: string,

}

const {announce, categoryName, authorDisplayName} = defineProps<Props>()


</script>
<template>
  <router-link :to="'/announcements/' + announce['announceId']" class="card">
    <p class="category-name">{{ categoryName }}</p>
    <p class="title">{{ announce['title'] }}</p>
    <!--    ユーザーidからユーザー名を取得して表示-->
    <p class="other-data">
      <span class="author">{{ authorDisplayName }}</span>
      <span class="date">
        {{ formatServerTimestamp(announce.createdAt, "yyyy/MM/dd") }}
      </span>
      <span class="date-updated" v-if="announce.updatedAt">
          ({{ formatServerTimestamp(announce.updatedAt, "yyyy/MM/dd") }}更新)
        </span>
    </p>

  </router-link>
</template>
<style scoped>

p {
  margin: 0;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding: 8px;

  text-decoration: none;
}

.category-name {
  font-size: .9em;
  color: gray;
}

.title {
  font-size: 1.4em;
  font-weight: bold;
}


.other-data {
  font-size: .9em;
  color: gray;
}


.date {
  margin-left: 2em;
}

.date-updated {
  margin-left: .5em;
}

</style>