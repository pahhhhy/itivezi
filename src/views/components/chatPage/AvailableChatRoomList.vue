<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import type {User} from 'firebase/auth'
import {get, getDatabase, ref as fireRef} from 'firebase/database'
import {formatServerTimestamp} from '@/utils/database'
import {collectRoomName} from "@/utils/chat/chat";
import {useChatRoomStore} from "@/stores/chatRoom";
import {useUserDataStore} from "@/stores/userPublicData";
import type {ChatRoom} from "@/types/chat/chat";
import FloatingButtonWrapper from "@/views/components/common/FloatingButtonWrapper.vue";
import FloatingButton from "@/views/components/common/FloatingButton.vue";
import SlideMenu from "@/views/components/common/SlideMenu.vue";
import CreateNewChatRoom from "@/views/components/chatPage/CreateNewChatRoom.vue";
import {useRouter} from "vue-router";
import LoadingSpinner from "@/views/components/common/LoadingSpinner.vue";


const {user} = defineProps<{
  user: User
}>()

const {usersPublicData} = useUserDataStore()
const roomNames = ref<{ [key: string]: string } | null>(null)

const {chatRooms} = useChatRoomStore()
const router = useRouter()


// ユーザー一覧
const db = getDatabase()
const usersRef = fireRef(db, 'testUser/')

const users = ref<string[]>([])
onMounted(async () => {
  const snapshot = await get(usersRef)
  users.value = snapshot.val() ? Object.keys(snapshot.val()) : []

  if (chatRooms.length !== 0) {
    loadRoomName(chatRooms)
  }
})
//TODO: チャットルーム削除時にchatRoomsで変更を検知する
watch(chatRooms, () => {
  loadRoomName(chatRooms)
}, {deep: true})

const loadRoomName = (rooms: ChatRoom[]): void => {
  if (!chatRooms) return
  const roomNamesTmp: { [key: string]: string } = {};
  (async () => {
    for (const room of rooms) {
      const gotRoomName = await collectRoomName(room, user.uid);
      if (gotRoomName) roomNamesTmp[room.roomId] = gotRoomName;
    }
    roomNames.value = roomNamesTmp;
  })();
}


const isVisibleCreateChatMenu = ref(false)
</script>

<template>
  <SlideMenu title="新規チャット作成" v-if="isVisibleCreateChatMenu" @close="isVisibleCreateChatMenu = false">
    <CreateNewChatRoom :user="user">

    </CreateNewChatRoom>
  </SlideMenu>
  <div class="wrapper" v-if="chatRooms">
    <h1>トーク</h1>

    <div v-if="chatRooms.length === 0 && roomNames">
      参加中のチャットルームがありません。作成ボタンを押して新たに会話を始めましょう!
    </div>
    <div v-else-if="roomNames">
      <router-link v-for="room in chatRooms" :to="'/chat/' + room.roomId" :key="room.roomId"
                   class="chat-room-card">
        <div class="upper-wrapper">
          <!--        ルーム名 (参加者名)-->
          <p class="room-name">
            {{ roomNames[room.roomId] }}
          </p>
          <p v-if="room.lastUpdateAt">{{
              new Date().toDateString() === new Date(room.lastUpdateAt as number).toDateString()
                  ? formatServerTimestamp(room.lastUpdateAt as number, "hh:mm")
                  : formatServerTimestamp(room.lastUpdateAt as number, "MM/dd")
            }}</p>
        </div>
        <div class="lower-wrapper" v-if="usersPublicData ">
          <!--          最終メッセージ-->
          <p class="last-message" v-if="room.lastMessage">
            {{ room.lastMessage.attachedFiles ? "ファイルを送信しました" : room.lastMessage.message }}</p>
          <p v-else>-</p>
          <!--          未読数-->
          <p v-if="room.unreadCount !== 0" class="unread">
            {{ room.unreadCount <= 99 ? room.unreadCount : "99+" }}</p>

        </div>
        <div class="right-wrapper">
          <IconRightArrow/>
        </div>
      </router-link>


      <!--      管理者へ連絡ボタン-->
      <!--      <button @click="async () => hook.checkDMRoomExists(await getAdminUid()!).then((value) => router.push('/chat/'+value))">DM</button>-->
      <FloatingButtonWrapper>
        <FloatingButton @click="isVisibleCreateChatMenu = true">
          <IconAdd/>
        </FloatingButton>
        <FloatingButton @click="router.push('/announcements')">
          <IconAnnouncement/>
        </FloatingButton>
      </FloatingButtonWrapper>
    </div>

    <LoadingSpinner v-else/>
  </div>


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
  min-height: 1em;
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

.loading-spinner {
  margin: auto auto;
  display: block;
}
</style>