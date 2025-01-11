<script setup>
import {useChatRoomStore} from "@/stores/chatRoom";

const chatRoomStore = useChatRoomStore()
</script>
<template>
  <i class="bi bi-chat-right-text  comment header-chat-icon">
    <span v-if="chatRoomStore.totalUnreadCount" class="count">{{ chatRoomStore.totalUnreadCount }}</span>
    <span class="text d-none d-sm-block">チャット</span>
  </i>
</template>
<style scoped>
.header-chat-icon {
  position: relative;
  right: 15px;

  .count {
    position: absolute;
    height: fit-content;
    width: fit-content;
    top: -5px;
    right: -12px;
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 2px 10px;
    font-size: 16px;
  }

  .text {
    position: absolute;
    top: 100%;
    left: 0;
    transform: translateX(-20%) translateY(-30%);

    width: 4em;
    font-size: 1rem;
    color: var(--text-color);
  }

}
</style>