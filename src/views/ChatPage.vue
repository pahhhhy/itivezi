<script setup lang="ts">
import {useRoleStore} from "@/stores/roleStore";
import Announcement from "@/views/components/chatPage/AnnouncementsList.vue";


const roleStore = useRoleStore()

roleStore.setRole('管理者') // TODO: 仮


</script>

<template>
  <h1>chat</h1>
  <div class="chat">
    <Announcement v-if="roleStore.role === '管理者'" />
    <Announcement v-if="roleStore.role !== '管理者'" />
  </div>
</template>

