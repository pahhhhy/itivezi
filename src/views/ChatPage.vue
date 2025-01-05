<script setup lang="ts">
import AvailableChatRoomList from '@/views/components/chatPage/AvailableChatRoomList.vue'
import {useAuthData} from '@/utils/auth'
import ChatDetailPage from '@/views/components/chatPage/ChatDetailPage.vue'
import {useChatRoomStore} from "@/stores/chatRoom";
import ChatRoomDataWrapper from "@/views/components/chatPage/ChatRoomDataWrapper.vue";
import {ref, watch} from "vue";


const {user} = useAuthData()
const chatRoomStore = useChatRoomStore()
const currentRoomId = ref<string | null>(null)
watch(() => chatRoomStore.currentRoom, (value) => {
  currentRoomId.value = value?.roomId ?? null
})



</script>

<template>
  <div class="chat" v-if="user">
    <ChatRoomDataWrapper :user="user">
      <AvailableChatRoomList v-if="!currentRoomId" :user="user"/>
      <ChatDetailPage v-else :user="user"/>
    </ChatRoomDataWrapper>
  </div>
</template>


<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: min(var(--breakpoint),100vw);
  margin: 0 auto;
}

</style>