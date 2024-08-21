<script setup lang="ts">
import type {Announcement} from "@/types/chatpage/announcement";
import {formatServerTimestamp} from "@/utils/database";

interface Props {
  announce: Announcement
}

const {announce} = defineProps<Props>()


</script>
<template>
  <router-link :to="'/announcements/' + announce['announceId']"
               style="border: 1px solid black; height: fit-content; width: 100%; display: flex; justify-content: space-between; gap: 3rem">
    <span>{{ announce["title"] }}</span><small>{{ formatServerTimestamp(announce["createdAt"]) }}</small>
  </router-link>
</template>