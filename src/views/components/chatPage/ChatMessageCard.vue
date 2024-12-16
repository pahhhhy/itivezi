<script lang="ts" setup>
import type { ChatMessage } from '@/types/chat/chat'
import type { UserPublicData } from '@/types/common/userPublicData'
import { formatServerTimestamp } from '@/utils/database'
import ChatAttachedFile from '@/views/components/chatPage/ChatAttachedFile.vue'

const { userId, message } = defineProps<{
  userId: string
  message: ChatMessage
  senderPublicData: UserPublicData
}>()
</script>

<template>
  <div v-if="message.undo" style="margin: 10px" class="message-container">
    <div>&lang;&lang; このメッセージは削除されました &rang;&rang;</div>
  </div>
  <div
    v-else
    :class="`message-container ${message.senderUid === userId ? 'my-message' : 'other-message'}`"
  >
    <div v-if="message.senderUid !== userId" class="message-icon">
      <img :src="senderPublicData.iconURL" alt="user icon" />
    </div>

    <!--            アイコン, 送信者名, 送信日時-->
    <!--              <div class="message-header">-->
    <!--                <div>{{ formatServerTimestamp(message.createdAt) }}</div>-->
    <!--                &lt;!&ndash;                操作&ndash;&gt;-->
    <!--                <div v-if="message.senderUid === userId">-->
    <!--                  <button @click="undoMessage(message)">送信取り消し</button>-->

    <!--                </div>-->
    <!--              </div>-->

    <!--            本文と投稿者-->
    <div class="message-content">
      <p v-if="message.senderUid !== userId" class="message-user-name">
        {{ senderPublicData.userName }}
      </p>
      <p class="message-text" v-if="message.message || !message.attachedFiles">
        <!-- 本文が空白でファイルが付いているのなら、本文を表示しない -->
        {{ message.message }}
      </p>
      <!--              添付ファイル-->
      <ChatAttachedFile :message="message"/>
    </div>

    <p class="date">
      {{
        // 今年送信されたメッセージで無いなら年も表示
        new Date().getFullYear() !== new Date(message.createdAt as number).getFullYear()
          ? formatServerTimestamp(message.createdAt as number, 'yyyy') + '/'
          : ''
      }}{{
        // 今日送信されたメッセージかどうか
        new Date().toDateString() === new Date(message.createdAt as number).toDateString()
          ? formatServerTimestamp(message.createdAt as number, 'hh:mm')
          : formatServerTimestamp(message.createdAt as number, 'MM/dd hh:mm')
      }}
    </p>
  </div>
</template>
<style scoped>
p {
  margin: 0;
}

.message-container {
  display: flex;
  flex-direction: row;
  gap: 10px;

  margin: 0 10px;
  padding: 0 5px;
  max-width: 80%;
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
  width: fit-content;
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

</style>