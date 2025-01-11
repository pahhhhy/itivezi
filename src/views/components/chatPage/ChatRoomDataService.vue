<script setup lang="ts">
import {useChatRoomStore} from "@/stores/chatRoom";
import {useRoute} from "vue-router";
import {onMounted, ref, watch} from "vue";
import type {User} from "firebase/auth";
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";


// propsからuserを取得
interface Props {
  user: User
}

const {user} = defineProps<Props>()

const {getJoinedRooms} = useChatRoomHook(user)
const {updateChatRoomData, setCurrentRoom} = useChatRoomStore()
// 参加可能なチャットルームを常に取得
getJoinedRooms((value) => {updateChatRoomData(value)})

// URLからroomIdを取得
const getRoomId = (): undefined | string => {
  const roomId: undefined | string | string[] = route.params.roomId
  if (typeof roomId === 'object') return roomId[0]
  else return roomId
}
const route = useRoute()
const roomId = ref<string | undefined>(getRoomId()) // URLの末尾からこのページのroomIdを取得して保管

setCurrentRoom(roomId.value ?? null)
watch(route, () => { // ページ遷移(ルーム入退出)を検知
  roomId.value = getRoomId()
  setCurrentRoom(roomId.value ?? null)
})

onMounted(() => {
  // ページ遷移時にスクロールを一番下にする
  const chat = document.querySelector('.chat')
  chat?.scrollTo(0, chat.scrollHeight)
})




</script>
<template>
  <slot></slot>
</template>