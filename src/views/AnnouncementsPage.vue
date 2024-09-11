<script setup lang="ts">
import AnnouncementsList from "@/views/components/announcementPage/announcementsList/AnnouncementsList.vue";
import {useAuthData} from "@/utils/auth";
import PostAnnouncementForm from "@/views/components/announcementPage/PostAnnouncementForm.vue";

const {role} = useAuthData();


</script>

<template>
  <h1>掲示板</h1>
  <div class="announcements">
    <PostAnnouncementForm v-if="role === '管理者'"/>
    <AnnouncementsList/>
  </div>
</template>

