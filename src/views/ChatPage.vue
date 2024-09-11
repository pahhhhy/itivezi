<script setup lang="ts">
import AvailableChatRoomList from "@/views/components/chatPage/AvailableChatRoomList.vue";
import {useAuthData} from "@/utils/auth";

const {user} = useAuthData()
</script>

<template>
  <h1>chat</h1>
  <div class="chat">
    <AvailableChatRoomList v-if="user" :user="user"/>


  </div>
</template>

