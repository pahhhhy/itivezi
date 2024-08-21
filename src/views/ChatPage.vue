<script setup lang="ts">
import AnnouncementsList from "@/views/components/chatPage/announcements/announcementsList/AnnouncementsList.vue";
import {getCurrentRole} from "@/utils/auth";
import {ref} from "vue";
import {getAuth} from "firebase/auth";
import PostAnnouncementForm from "@/views/components/chatPage/PostAnnouncementForm.vue";

const role: any = ref(undefined);
getCurrentRole(getAuth()).then((newRole) => {
  role.value = newRole;
});


</script>

<template>
  <h1>chat</h1>
  <div class="chat">
    <PostAnnouncementForm v-if="role === '管理者'"/>
    <AnnouncementsList />
  </div>
</template>

