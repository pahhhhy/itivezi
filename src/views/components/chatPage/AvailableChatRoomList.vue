<script setup lang="ts">
import {useChatRoomHook} from '@/utils/chat/useChatRoomHook'
import {onMounted, ref} from 'vue'
import type {User} from 'firebase/auth'
import {get, getDatabase, ref as fireRef} from 'firebase/database'
import {formatServerTimestamp} from '@/utils/database'
import {collectRoomName} from "../../../utils/chat/chat";
import {useChatRoomStore} from "@/stores/chatRoom";
import {useUserDataStore} from "@/stores/userPublicData";

const {user} = defineProps<{
  user: User
}>()

const {usersPublicData} = useUserDataStore()

const selectedUser = ref<string>(user.uid)
const {chatRooms} = useChatRoomStore()


// ユーザー一覧
const db = getDatabase()
const usersRef = fireRef(db, 'testUser/')

const users = ref<string[]>([])


onMounted(async () => {
  const snapshot = await get(usersRef)
  users.value = snapshot.val() ? Object.keys(snapshot.val()) : []
})


</script>

<template>
  <div class="wrapper" v-if="chatRooms">
    <h1>トーク</h1>

    <div v-if="chatRooms.length === 0">
      参加中のチャットルームがありません。作成ボタンを押して新たに会話を始めましょう!
    </div>


    <router-link v-else v-for="room in chatRooms" :to="'/chat/' + room.roomId" :key="room.roomId"
                 class="chat-room-card">
      <!--          <div>{{ room.roomId }}</div>-->
      <!--        <router-link class="arrow" :to="'/chat/' + room.roomId">&rangle;</router-link>-->
      <div class="upper-wrapper">
        <!--        ルーム名 (参加者名)-->
        <p class="room-name">
          {{ collectRoomName(room, user.uid) }}
        </p>
        <p v-if="room.lastUpdateAt">{{
            new Date().toDateString() === new Date(room.lastUpdateAt as number).toDateString()
                ? formatServerTimestamp(room.lastUpdateAt as number, "hh:mm")
                : formatServerTimestamp(room.lastUpdateAt as number, "MM/dd")
          }}</p>
      </div>
      <div class="lower-wrapper" v-if="usersPublicData && room.lastMessage">
        <!--          最終メッセージ-->
        <p class="last-message">{{ room.lastMessage?.message }}</p>
        <!--          未読数-->
        <p v-if="room.lastReadAt[user.uid] && room.unreadCount !== 0" class="unread">
          {{ room.unreadCount <= 99 ? room.unreadCount : "99+" }}</p>

          {{ room.unreadCount}}
      </div>
      <div class="right-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666">
          <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
        </svg>
      </div>

      <!--        <div>-->
      <!--          <button @click="deleteChatRoom(room.roomId)">削除</button>-->
      <!--          <button @click="leaveChatRoom(room.roomId)">退出</button>-->
      <!--          <button @click="addUserToChatRoom(room.roomId, selectedUser)">追加</button>-->
      <!--          <router-link :to="'/chat/' + room.roomId">入室</router-link>-->
      <!--        </div>-->
    </router-link>
  </div>


  <!--    ここは切り出す-->
  <!--    <div v-if="users">-->
  <!--      <h1>新規DM作成</h1>-->
  <!--      <select v-model="selectedUser">-->
  <!--        <option v-for="user in users" :key="user">{{ user }}</option>-->
  <!--      </select>-->
  <!--      <button @click="createDMRoom(selectedUser)">作成</button>-->
  <!--    </div>-->
  <!--    ここまで切り出す-->

</template>

<style scoped>
p {
  margin: 0;
}

h1 {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--text-color);
  font-size: 1.5em;
  font-weight: bold;
}

.wrapper {
  width: calc(100% - 60px);
}

.chat-room-card {
  border-bottom: 1px solid lightgray;
  margin: 10px auto;
  width: calc(100% - 20px);
  height: 70px;
  padding: 10px 0 10px 10px;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 2em;
  color: var(--text-color);
  text-decoration: none;
}

.upper-wrapper {
  grid-column: 1;
  grid-row: 1 / span 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lower-wrapper {
  grid-column: 1;
  display: flex;
  justify-content: space-between;
  height: auto;
  width: 100%;

  .last-message {
    max-width: 200px;
    width: 100%;
    flex-shrink: 1;
    font-size: 0.85em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread {
    background-color: var(--main-color);
    color: white;
    border-radius: 10px;
    padding: 2px 5px;
    font-size: 0.8em;
    flex-shrink: 0;
  }
}

.right-wrapper {
  display: grid;
  grid-column: 2;
  grid-row: 1 / span 2;
  height: 200%;
  place-content: center;
  margin: auto 0 auto 5px;
}

.room-name {
  font-size: 1em;
  font-weight: bold;
}

.last-message-date {
  font-size: 0.8em;
}

</style>