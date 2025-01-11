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
        <span style="font-size: .8em;">更新:</span> {{ formatServerTimestamp(announce.updatedAt, "yyyy/MM/dd") }}
        </span>
    </p>
  </router-link>
</template>
<style scoped>

* {
  color: var(--text-color);
}
p {
  margin: 0;
}

.card {
  margin: 0 0 8px 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-decoration: none;
  border: none;
}

.category-name {
  margin-bottom: -4px
}
.category-name, .other-data {
  font-size: .9em;
}

.title {
  font-size: 1.2em;
  font-weight: bold;
}


.date {
  margin-left: 12px;
}

.date-updated {
  font-size: .9em;
  margin-left: 8px;
}

</style>