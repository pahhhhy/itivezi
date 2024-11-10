<script setup lang="ts">
import {ref} from "vue";
import {useChatMessageHook} from "@/utils/chat/useChatMessageHook";
import type {ChatMessage} from "@/types/chat/chat";
import {serverTimestamp} from "firebase/database";
import type {User} from "firebase/auth";
import {formatServerTimestamp} from "@/utils/database";
import {useUserDataStore} from "@/stores/userPublicData";
import { RouterLink } from 'vue-router'
import type { UserPublicData } from '@/types/common/userPublicData'


const {user, roomId} = defineProps<{
  user: User
  roomId: string
}>();
const userid = ref<string>(user.uid);

// piniaのuseUserStoreから登場ユーザーをすべて取得
const {getUserPublicData} = useUserDataStore();

const usersPublicData = ref<Record<string, UserPublicData> | undefined>(undefined);

const {
  messages,
  sendMessage,
} = useChatMessageHook(roomId, data => {
  // dataは{messageId: ChatMessage}の形式
  const allMessageSenders = Object.values(data).map(message => message.senderUid);
  const uniqueMessageSenders = Array.from(new Set(allMessageSenders));
  uniqueMessageSenders.forEach((uid: string) => {
    getUserPublicData(uid).then(data => {
      if (!usersPublicData.value) usersPublicData.value = {};
      if (!usersPublicData.value[uid] && data)
      usersPublicData.value = {
        ...usersPublicData.value,
        [uid]: data
      }
    })
  })
});


const sendMessageCallback = () => {
  const createdAt = serverTimestamp();
  const messageData: ChatMessage = {
    senderUid: userid.value,
    messageId: '',
    message: message.value,
    roomId,
    createdAt,
  }
  sendMessage(messageData)
}

const message = ref<string>('')


</script>

<template>
  <div>
    <h1>chat detail</h1>
    <router-link to="/chat">&lg;戻る</router-link>
    <div class="chat">
      <div v-if="messages">
        <div v-for="message in messages" :key="message.messageId" style="margin-top: 20px;">
          <div v-if="usersPublicData && usersPublicData[message.senderUid]" class="message-container">
            <div class="message-header">
              <img :src="usersPublicData[message.senderUid].iconURL" alt="user icon">
              <div> {{ usersPublicData[message.senderUid].userName }}</div>
              <div>{{ formatServerTimestamp(message.createdAt) }}</div>
            </div>

            <div class="message-content">{{ message.message }}</div>
          </div>
        </div>

      </div>
      <div>
        <input type="text" v-model="message" placeholder="メッセージを入力してください">
        <button @click="sendMessageCallback()">送信</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-container {
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: start;
  height: 30px;
}

.message-header img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.message-header div {
  margin-left: 10px;
}

.message-content {
  margin: -10px 0 20px 40px;
}
</style>