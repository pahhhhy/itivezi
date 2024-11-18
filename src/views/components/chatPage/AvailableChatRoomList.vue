<script setup lang="ts">
import {useChatRoomHook} from '@/utils/chat/useChatRoomHook'
import {type ChatRoom} from '@/types/chat/chat'
import {onMounted, ref} from 'vue'
import type {User} from 'firebase/auth'
import {get, getDatabase, ref as fireRef} from 'firebase/database'
import {useUserDataStore} from '@/stores/userPublicData'
import type {UserPublicData} from '@/types/common/userPublicData'
import {formatServerTimestamp} from '@/utils/database'

const {user} = defineProps<{
  user: User
}>()

const {
  deleteChatRoom,
  leaveChatRoom,
  addUserToChatRoom,
  createDMRoom,
  getJoinedRooms,
  getUnreadCount,
} = useChatRoomHook(user)

const selectedUser = ref<string>(user.uid)

const chatRooms = ref<ChatRoom[] | undefined>(undefined)

// piniaのuseUserStoreから登場ユーザーをすべて取得
const {getUserPublicData} = useUserDataStore()
const usersPublicData = ref<Record<string, UserPublicData> | undefined>(undefined)
const unreadCount = ref<Record<string, number>>({}); // ルームID: 未読数

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
  // 未読件数について走査
  // もしすでに未読数があるものが更新されたならインクリメント
  // そうでないなら既読か未読かを判定、未読なら未読数を取得
  value.forEach((room) => {
    if (unreadCount.value[room.roomId] && room.lastUpdateAt && unreadCount.value[room.roomId] < (room.lastUpdateAt as number)) { // 未読数があるものが更新された
      getUnreadCount(room.roomId).then((count) => {
        unreadCount.value[room.roomId] = count // 未読数を取得
      })
    } else {
      if (room.lastReadAt[user.uid] && room.lastUpdateAt && room.lastReadAt[user.uid] < room.lastUpdateAt) { // 未読
        getUnreadCount(room.roomId).then((count) => {
          unreadCount.value[room.roomId] = count // 未読数を取得
        })
      } else {
        unreadCount.value[room.roomId] = 0 // 既読
      }
    }
  })

})

// 定期的に参加済みのルームの

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
          <div v-if="room.lastReadAt[user.uid]">
            <p>最終閲覧{{ room.lastReadAt[user.uid] }}</p>
            <p>最終更新{{ room.lastUpdateAt }}</p>
            <p>{{ unreadCount[room.roomId] === 0 ? '既読' : `${unreadCount[room.roomId]}件の未読` }}</p>
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