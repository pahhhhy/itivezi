<script setup lang="ts">

import type {User} from "firebase/auth";
import type {ChatRoom} from "@/types/chat/chat";
import RoomNameSetting from "@/views/components/chatPage/RoomNameSetting.vue";
import RoomUserSetting from "@/views/components/chatPage/RoomUserSetting.vue";
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import router from "@/router";

interface Props {
  roomName: string;
  user: User;
  room: ChatRoom;
}

const {user, room, roomName} = defineProps<Props>();

const {deleteChatRoom} = useChatRoomHook(user);
const deleteRoom = async () => {
  if (window.confirm('このルームの全てのチャット履歴と添付ファイルが削除されます。本当に削除しますか？')) {
    await deleteChatRoom(room.roomId);
    await router.push('/chat');
    window.location.reload();
  }
}


</script>

<template>
  <div class="settings">
    <RoomNameSetting :room :roomName/>
    <RoomUserSetting :room :user/>


    <div>
      <!--      ルーム削除-->
      <button class="delete-room-button" @click="deleteRoom">ルームを削除</button>
    </div>
  </div>

</template>

<style scoped>

.settings {
  margin: 1rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: min(var(--breakpoint), 100vw);
  height: fit-content;
  padding: 0 2rem;
}

.delete-room-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: white;
  color: red;
  border: 1px solid red;
  border-radius: 5px;
  cursor: pointer;
}

</style>