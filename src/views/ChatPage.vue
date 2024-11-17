<script setup lang="ts">
import AvailableChatRoomList from '@/views/components/chatPage/AvailableChatRoomList.vue'
import {useAuthData} from '@/utils/auth'
import {useRoute} from 'vue-router'
import ChatDetailPage from '@/views/ChatDetailPage.vue'
import {ref, watch} from 'vue'

const getRoomId = (): undefined | string => {
  const roomId: undefined | string | string[] = route.params.roomId
  console.log('roomId: ', roomId)

  if (typeof roomId === 'object') return roomId[0]
  else return roomId
}

const {user} = useAuthData()
const route = useRoute()
// URLの末尾からこのページのroomIdを取得して保管
const roomId = ref<string | undefined>(getRoomId())

watch(route, () => {
  // ページ遷移(ルーム入退出)を検知
  roomId.value = getRoomId()
})


</script>

<template>
  <h1>chat</h1>

  <div class="chat" v-if="user">
    <p>{{ roomId }}</p>
    <AvailableChatRoomList v-if="!roomId" :user="user"/>
    <div v-else>
      <ChatDetailPage :roomId="roomId" :user="user"/>
    </div>
  </div>
</template>
