<script lang="ts" setup>
import type {ChatMessage} from '@/types/chat/chat'
import type {UserPublicData} from '@/types/common/userPublicData'
import {formatServerTimestamp} from '@/utils/database'
import ChatAttachedFile from '@/views/components/chatPage/ChatAttachedFile.vue'
import {onMounted, ref} from 'vue'
import MessageContextMenu from "@/views/components/chatPage/MessageContextMenu.vue";

const {userId, message, senderPublicData, onContextMenu} = defineProps<{
  userId: string
  message: ChatMessage
  senderPublicData: UserPublicData
  selectedContextMenuMessageId: string | null
  onContextMenu?: (e: MouseEvent) => void
}>()
const emit = defineEmits<{
  (event: 'closeContextMenu'): void
}>()
const messageContainerRef = ref<HTMLElement | null>(null)
const rightClickedCount = ref(0)

onMounted(() => {
  // 右クリックや長押しされたときの挙動について
  if (messageContainerRef.value && onContextMenu) {

    if (message.senderUid === userId) { // 現状は自分のメッセージでのみ右クリックメニューを開けるようにする
      messageContainerRef.value.addEventListener('contextmenu', (e: MouseEvent) => {
        if (rightClickedCount.value === 0) e.preventDefault(); // 二回目以降はデフォルトの右クリックメニューを表示
        rightClickedCount.value++
        onContextMenu(e)
      })
    }
  }
})

const onCloseContextMenu = () => {
  rightClickedCount.value = 0
  emit('closeContextMenu')
}


</script>

<template>
  <div v-if="message.undo" style="text-align: center; margin: 10px auto;width: 100%;color: gray;">
    &lang;&lang; このメッセージは取り消されました &rang;&rang;
  </div>
  <div
      v-else
      :class="`message-container ${message.senderUid === userId ? 'my-message' : 'other-message'}`"
      ref="messageContainerRef"
  >
    <div v-if="message.senderUid !== userId" class="message-icon">
      <img :src="senderPublicData.iconURL" alt="user icon"/>
    </div>

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
    <MessageContextMenu v-if="selectedContextMenuMessageId === message.messageId" :message
                        @close="onCloseContextMenu"/>
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
  position: relative;

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