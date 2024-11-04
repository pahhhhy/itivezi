<script setup lang="ts">
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import {adminUid, type ChatRoom} from "@/types/chat/chat";
import {ref} from "vue";
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
  getRooms
} = useChatRoomHook(user);

const userid = ref<string>(user.uid);

const chatRooms = ref<ChatRoom[] | undefined>(undefined);

// getJoinedRoomsOnce().then(rooms => {
//   chatRooms.value = rooms;
// });


// 参加可能なチャットルームを常に取得
getRooms((value) => {
  chatRooms.value = value;
});


// TODO: 今できたこと: チャットルームの作成、削除、退出、追加, 参加中のチャットルームの取得
// TODO: 今後やるべきこと: /messages以下の機能(メッセージ送信, 受信, 編集, 削除, 画像送信...)
</script>

<template>
  <div>
    <button @click="createDMRoom(adminUid)">作成</button>
    <div v-if="chatRooms">

      <div v-if="chatRooms.length === 0">
        参加中のチャットルームがありません。作成ボタンを押して新たに会話を始めましょう!
      </div>
      <div v-else v-for="room in chatRooms" :key="room.roomId">
        <div>
          <div>{{ room.roomId }}</div>
          <div>{{ room.roomName }}</div>
          <div>{{ room.roomType }}</div>
          <div>{{ room.members }}</div>
          <button @click="deleteChatRoom(room.roomId)">削除</button>
          <button @click="leaveChatRoom(room.roomId)">退出</button>
          <button @click="addUserToChatRoom(room.roomId, userid)">追加</button>
          <a :href="'/chat/' + room.roomId">入室</a>
        </div>
      </div>
    </div>
    <input type="text" v-model="userid"/>
  </div>
</template>