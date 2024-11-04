<script setup lang="ts">
import AvailableChatRoomList from "@/views/components/chatPage/AvailableChatRoomList.vue";
import {useAuthData} from "@/utils/auth";
import {useRoute} from "vue-router";
import ChatDetailPage from "@/views/ChatDetailPage.vue";

const {user} = useAuthData()
const route = useRoute()
// URLの末尾からこのページのroomIdを取得して保管
const roomId = route.params.roomId
</script>

<template>
  <h1>chat</h1>
  <div class="chat" v-if="user">
    <AvailableChatRoomList v-if="!roomId" :user="user"/>
    <div v-else-if="roomId">
      <ChatDetailPage :roomId="roomId" :user="user"/>
    </div>


  </div>
</template>

