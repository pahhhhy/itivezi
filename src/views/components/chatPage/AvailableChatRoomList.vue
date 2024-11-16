<script setup lang="ts">
import { useChatRoomHook } from '@/utils/chat/useChatRoomHook'
import { type ChatRoom } from '@/types/chat/chat'
import { onMounted, ref } from 'vue'
import type { User } from 'firebase/auth'
import { get, getDatabase, ref as fireRef } from 'firebase/database'
import { useUserDataStore } from '@/stores/userPublicData'
import type { UserPublicData } from '@/types/common/userPublicData'
import { formatServerTimestamp } from '@/utils/database'

const { user } = defineProps<{
  user: User
}>()

const {
  createChatRoom,
  deleteChatRoom,
  leaveChatRoom,
  addUserToChatRoom,
  createDMRoom,
  getJoinedRooms
} = useChatRoomHook(user)

const selectedUser = ref<string>(user.uid)

const chatRooms = ref<ChatRoom[] | undefined>(undefined)

// getJoinedRoomsOnce().then(rooms => {
//   chatRooms.value = rooms;
// });

// piniaのuseUserStoreから登場ユーザーをすべて取得
const { getUserPublicData } = useUserDataStore()
const usersPublicData = ref<Record<string, UserPublicData> | undefined>(undefined)

// 参加可能なチャットルームを常に取得
getJoinedRooms((value) => {
  // 関係のあるユーザー(参加中のルームに参加しているすべての他のユーザー)のIDからユーザー情報を取得しておく
  const allRelatedUsers = Array.from(new Set(value.map((room) => Object.keys(room.users)).flat())) // 重複排除
  allRelatedUsers.forEach((uid: string) => {
    getUserPublicData(uid).then((data) => {
      if (!usersPublicData.value) usersPublicData.value = {}
      if (!usersPublicData.value[uid] && data)
        usersPublicData.value = {
          ...usersPublicData.value,
          [uid]: data
        }
    })
  })

  chatRooms.value = value
})

// TODO: 今できたこと: チャットルームの作成、削除、退出、追加, 参加中のチャットルームの取得
// TODO: 今後やるべきこと: /messages以下の機能(メッセージ送信, 受信, 編集, 削除, 画像送信...)

// ----- 切り分け&セキュリティルール整備予定 -----

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
  <div>
    <button @click="createDMRoom(selectedUser)">作成</button>
    <div v-if="chatRooms">
      <div v-if="chatRooms.length === 0">
        参加中のチャットルームがありません。作成ボタンを押して新たに会話を始めましょう!
      </div>
      <div v-else v-for="room in chatRooms" :key="room.roomId" class="chat-room">
        <!--          <div>{{ room.roomId }}</div>-->
        <div>
          {{
            room.roomName ??
            Object.keys(room.users)
              .filter((u) => u !== user.uid)
              .map((u: string) =>
                usersPublicData && usersPublicData[u] ? usersPublicData[u].userName : u
              )
              .join(', ')
          }}
        </div>

        <div>
          <div>
            {{
              usersPublicData &&
              room.lastMessage &&
              (usersPublicData[room.lastMessage.senderUid]
                ? usersPublicData[room.lastMessage.senderUid].userName
                : room.lastMessage.senderUid)
            }}: {{ room.lastMessage?.message }} ({{
              room.lastUpdateAt && formatServerTimestamp(room.lastUpdateAt)
            }})
          </div>
        </div>

        <div>
          <button @click="deleteChatRoom(room.roomId)">削除</button>
          <button @click="leaveChatRoom(room.roomId)">退出</button>
          <button @click="addUserToChatRoom(room.roomId, selectedUser)">追加</button>
          <router-link :to="'/chat/' + room.roomId">入室</router-link>
        </div>
      </div>
    </div>

    <div v-if="users">
      <select v-model="selectedUser">
        <option v-for="user in users" :key="user">{{ user }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.chat-room {
  border: 1px solid black;
  margin-top: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>