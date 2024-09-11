<script setup lang="ts">
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import {adminUid, type ChatRoom} from "@/types/chat/chat";
import {ref} from "vue";
import type {DataSnapshot} from "firebase/database";
import type {User} from "firebase/auth";


const {user} = defineProps<{
  user: User
}>();

const {
  createChatRoom,
  deleteChatRoom,
  leaveChatRoom,
  addUserToChatRoom,
  createDMRoom,
  joinedRoomsObserver
} = useChatRoomHook(user);

const userid = ref<string>('');

const chatRooms = ref<ChatRoom[]>([]);
joinedRoomsObserver((rooms: DataSnapshot) => {
  console.log("test")
  chatRooms.value = rooms.val();
});


</script>
<template>
  <div>
    <button @click="createDMRoom(adminUid)">作成</button>
    <input type="text" v-model="userid"/>
    {{ chatRooms }}
  </div>
</template>