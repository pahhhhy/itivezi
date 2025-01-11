<script setup lang="ts">

import type {User} from "firebase/auth";
import type {ChatRoom} from "@/types/chat/chat";
import {useUserDataStore} from "@/stores/userPublicData";
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import {ref, toRef, toRefs, watch} from "vue";
import router from "@/router";

interface Props {
  room: ChatRoom
  user: User
}
const props = defineProps<Props>();
const {user} = props
const room = toRef(() => props.room);
const {usersPublicData} = useUserDataStore()
const {removeUserFromChatRoom} = useChatRoomHook(user);
const roomUsersId = ref<string[]>(Object.keys(room.value.users));

const {deleteChatRoom} = useChatRoomHook(user);

const deleteUser = async (userId: string) => {
  const message = roomUsersId.value.length <= 1 ? '参加者が存在しなくなるため、自動的にこのルームが削除されます。このルームから脱退しますか?' : 'このルームから脱退しますか？';
  if (window.confirm(message)) {
    // ユーザー削除処理
    await removeUserFromChatRoom(room.value.roomId, userId);

    // もし脱退前のユーザーが1人だった場合、脱退によって0人になるのでルーム自体を削除する
    if (roomUsersId.value.length === 1) {
      await deleteChatRoom(room.value.roomId);
    }

    await router.push('/chat');
    window.location.reload();
  }
}

watch(() => room, (newRoom) => {
  roomUsersId.value = Object.keys(newRoom.value.users);
}, {deep: true});


</script>

<template>
  <div class="room-user-setting">
    <h2>参加中のユーザー</h2>
    <ul>
      <li v-for="roomUserId in roomUsersId" :key="roomUserId" class="user">
        <img :src="usersPublicData[roomUserId].iconURL" alt="icon">
        <p>{{ usersPublicData[roomUserId].userName }}</p>
        <button v-if="roomUserId === user.uid" @click="deleteUser(roomUserId)">脱退</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.room-user-setting {
  margin: 1rem 0;
  width: 100%;
  display: flex;
  flex-direction: column;


  h2 {
    text-align: left;
    margin: 0;
    font-size: 1.125em;
    font-weight: bold;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    button {
      margin: 0 0 0 10px;
      padding: 5px 10px;
      background: none;
      border-radius: 5px;
      border: 1px solid var(--text-color);
    }

  }
}
</style>