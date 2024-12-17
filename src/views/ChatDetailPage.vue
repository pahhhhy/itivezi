<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useChatMessageHook } from '@/utils/chat/useChatMessageHook'
import type { User } from 'firebase/auth'
import { useUserDataStore } from '@/stores/userPublicData'
import { RouterLink } from 'vue-router'
import type { UserPublicData } from '@/types/common/userPublicData'
import { useChatRoomStore } from '@/stores/chatRoom'
import ChatMessageCard from '@/views/components/chatPage/ChatMessageCard.vue'
import ChatInputArea from '@/views/ChatInputArea.vue'

const { user } = defineProps<{
  user: User
}>()
const userid = ref<string>(user.uid)

// piniaのuseUserStoreから登場ユーザーをすべて取得
const { getUserPublicData, usersPublicData } = useUserDataStore()

const { currentRoom } = useChatRoomStore()
const roomId = currentRoom?.roomId || ''


let unmounted = false
onMounted(() => {
  unmounted = false
})
onUnmounted(() => {
  unmounted = true
})

const { messages, isEnd, checkUpdateLastReadAt, sendMessage, undoMessage, readMoreMessages } =
  useChatMessageHook(roomId, user, (data) => {
    // onMessageUpdatedのコールバック
    // dataは{messageId: ChatMessage}の形式

    if (unmounted) return
    // const allMessageSenders = Object.values(data).map((message) => message.senderUid)
    // const uniqueMessageSenders = Array.from(new Set(allMessageSenders))
    // uniqueMessageSenders.forEach((uid: string) => {
    //   getUserPublicData(uid).then((data) => {
    //     if (!usersPublicData.value) usersPublicData.value = {}
    //     if (!usersPublicData.value[uid] && data)
    //       usersPublicData.value = {
    //         ...usersPublicData.value,
    //         [uid]: data
    //       }
    //   })
    // })

    checkUpdateLastReadAt() // ChatDetailPageからのみ呼び出すことで表示されていることが保証される
  })
</script>

<template>
  <div class="chatroom-wrapper">
    <!--    ルーム名-->
    <!--    <h1>{{collectRoomName(room, )}}</h1>-->
    <router-link to="/chat">&lg;戻る</router-link>
    <div class="chatroom-viewport">
      <div v-if="messages">
        <p v-if="isEnd">一番上まで読み込みました</p>
        <button v-else @click="readMoreMessages()">さらに読み込む</button>
        <div v-for="message in messages" :key="message.messageId" style="margin-top: 20px">
          <ChatMessageCard
            v-if="usersPublicData && usersPublicData[message.senderUid]"
            :userId="userid"
            :message="message"
            :senderPublicData="usersPublicData[message.senderUid]"
          />
        </div>
      </div>
    </div>
    <ChatInputArea class="input-area" :roomId="roomId" :user="user" />
  </div>
</template>

<style scoped>
p {
  margin: 0;
}

.chatroom-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: calc(100vh - 80px); /* ヘッダーの高さ*/

  overflow: hidden;
}

.chatroom-viewport {
  flex-grow: 0;
  top: 0;
  left: 0;
  height: auto;
  overflow-y: scroll;

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.input-area {
  flex-grow: 1;
  bottom: 0;
  left: 0;
  height: fit-content;
  max-height: 50%;
  border-top: gray 1px solid;
  display: flex;
  flex-direction: column;
  padding: 0 12px;
}

.message-container {
  display: flex;
  flex-direction: row;
  gap: 10px;

  margin: 0 10px;
  padding: 0 5px;
  max-width: 80%;
}

.my-message {
  align-self: flex-end;
  margin-left: auto;
  flex-direction: row-reverse;
}

.other-message {
  align-self: flex-start;
  margin-right: auto;
}

.message-icon {
  display: flex;
  align-items: start;
  height: 30px;
  margin-top: 1em;
}

.message-icon img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.message-header div {
  margin-left: 10px;
}

.message-user-name {
  font-size: 0.85em;
}

.date {
  font-size: 0.8em;
  margin: auto 0 4px;
}

.message-content {
}

.message-text {
  padding: 10px;
  border-radius: 20px;
}

.my-message .message-text,
.my-message .message-attached {
  border-radius: 20px;
  background-color: var(--sub-color);
}

.other-message .message-text,
.other-message .message-attached {
  border-radius: 20px;
  background-color: var(--background-color);
}

.message-attached {
}

.message-attached-file {
  position: relative;
  height: 64px;
  width: fit-content;

  svg {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
  }

  a {
    position: relative;
    z-index: 1;
    display: grid;
    place-content: center;
    padding: 0 20px 0 48px;
    height: 100%;
    width: fit-content;
    text-decoration: none;
    text-align: center;
    color: var(--text-color);
  }
}
</style>
