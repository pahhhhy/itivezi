<script setup lang="ts">
import {onMounted, onUnmounted, provide, ref, watch} from 'vue'
import {useChatMessageHook} from '@/utils/chat/useChatMessageHook'
import type {User} from 'firebase/auth'
import {useUserDataStore} from '@/stores/userPublicData'
import {RouterLink} from 'vue-router'
import {useChatRoomStore} from '@/stores/chatRoom'
import ChatMessageCard from '@/views/components/chatPage/ChatMessageCard.vue'
import ChatInputArea from '@/views/ChatInputArea.vue'
import {collectRoomName} from '@/utils/chat/chat'

const {user} = defineProps<{
  user: User
}>()
const userid = ref<string>(user.uid)
// piniaのuseUserStoreから登場ユーザーをすべて取得
const {getUserPublicData, usersPublicData} = useUserDataStore()
const {currentRoom} = useChatRoomStore()
const roomId = currentRoom?.roomId || ''
provide('user', user);
provide('roomId', roomId);
const {messages, isEnd, checkUpdateLastReadAt, readMoreMessages} =
    useChatMessageHook(roomId, user, (data) => {
      // onMessageUpdatedのコールバック
      // dataは{messageId: ChatMessage}の形式

      const allMessageSenders = Object.values(data).map((message) => message.senderUid)
      const uniqueMessageSenders = Array.from(new Set(allMessageSenders))
      uniqueMessageSenders.forEach((uid: string) => {
        getUserPublicData(uid)
      })

      checkUpdateLastReadAt() // ChatDetailPageからのみ呼び出すことで表示されていることが保証される
    })
const chatroomViewport = ref<null | HTMLElement>(null);
const chatMessagesContainer = ref<null | HTMLElement>(null);
const oldChatMessagesContainerHeight = ref<number>(0);
const oldScrollTop = ref<number>(0);
const didInitialScroll = ref<boolean>(false);
const scrollIgnoreFlag = ref<boolean>(false);
const loadOldMessagesFlag = ref<boolean>(false);
const isThereUnReadMessage = ref(false); // スクロール中に新しいメッセージが追加されてかつまだ表示されていないかどうかを格納するref
const isBottomMessageInView = ref(false);
const refTop = ref<HTMLElement | null>(null);
const refBottom = ref<HTMLElement | null>(null);
const refMessages = ref<HTMLElement[] | null>(null);

const selectedContextMenuMessageId = ref<string | null>(null);

const topObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !isEnd.value && didInitialScroll.value && chatMessagesContainer.value) {
      oldScrollTop.value = chatMessagesContainer.value?.scrollTop || 0;
      oldChatMessagesContainerHeight.value = chatMessagesContainer.value.scrollHeight;
      loadOldMessagesFlag.value = true;
      readMoreMessages().then(() => {
        // chatMessagesContainer.value!.scrollTop = chatMessagesContainer.value!.scrollHeight - oldChatMessagesContainerHeight.value + oldScrollTop.value;
        loadOldMessagesFlag.value = false;
        chatMessagesContainer.value!.scrollTop += 10;
      });
    }
  });
});
const bottomObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    isBottomMessageInView.value = entry.isIntersecting;
    if (isThereUnReadMessage.value) isThereUnReadMessage.value = false; // もし一番下に来たときにまだ未読メッセージフラグが立っているならば折る

  });
});

const heightObserver = new ResizeObserver((entries) => {
  if (!didInitialScroll.value || !chatMessagesContainer.value) return;

  if (scrollIgnoreFlag.value) {
    scrollIgnoreFlag.value = false;
    return;
  }

  if (oldChatMessagesContainerHeight.value === 0) {
    oldChatMessagesContainerHeight.value = chatMessagesContainer.value.scrollHeight;
  } else {
    if (isThereUnReadMessage.value) return;
    const diff = chatMessagesContainer.value.scrollHeight - oldChatMessagesContainerHeight.value;
    chatroomViewport.value!.scrollTop += diff;
  }
});


onMounted(() => {
  if (refTop.value) {
    topObserver.observe(refTop.value);
  }
  if (refBottom.value) {
    bottomObserver.observe(refBottom.value);
  }
  if (refMessages.value) {
    refMessages.value.forEach((message) => {
      bottomObserver.observe(message);
    });
  }
  if (chatMessagesContainer.value) {
    // heightObserver.observe(chatMessagesContainer.value);
  }

  // タイミングを調整してスクロールを実行
  setTimeout(() => {
    scrollToBottom();
    didInitialScroll.value = true;
  });
});

onUnmounted(() => {
  if (refBottom.value) {
    bottomObserver.unobserve(refBottom.value);
  }
  if (refTop.value) {
    topObserver.unobserve(refTop.value);
  }
  if (refMessages.value) {
    refMessages.value.forEach((message) => {
      bottomObserver.unobserve(message);
    });
  }
  if (chatMessagesContainer.value) {
    // heightObserver.unobserve(chatMessagesContainer.value);
  }
})

watch(() => refMessages.value?.length, () => {
  if (isBottomMessageInView.value && didInitialScroll.value) {
    scrollToBottom();
  } else {
    if (!loadOldMessagesFlag.value) isThereUnReadMessage.value = true;
  }
})

const scrollToBottom = () => {
  if (!chatroomViewport.value) return;

  // スクロール位置を最下部に設定
  chatroomViewport.value.scrollTop = chatroomViewport.value.scrollHeight;
};

const initialScroll = () => {
  scrollToBottom();
  didInitialScroll.value = true;
};
</script>

<template>
  <div class="chatroom-wrapper" v-if="currentRoom">
    <div class="room-header">
      <p>
        <router-link to="/chat">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#5C5C5C"
          >
            <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/>
          </svg>
        </router-link>
        {{ collectRoomName(currentRoom, userid) }}
      </p>
    </div>
    <div class="chatroom-viewport" ref="chatroomViewport">
      <div v-if="messages" ref="chatMessagesContainer">
        <p v-if="isEnd" class="message-top">一番上まで読み込みました</p>
        <div ref="refTop"></div>
        <div v-for="(message) in messages" :key="message.messageId" style="margin-top: 20px" ref="refMessages">
          <ChatMessageCard
              v-if="usersPublicData && usersPublicData[message.senderUid]"
              :userId="userid"
              :message="message"
              :senderPublicData="usersPublicData[message.senderUid]"
              :selectedContextMenuMessageId="selectedContextMenuMessageId"
              :onContextMenu="(e: MouseEvent) => {
                selectedContextMenuMessageId = message.messageId
              }"
              @closeContextMenu="selectedContextMenuMessageId = null"
          />
        </div>
        <div ref="refBottom" style="margin-bottom: 10px;"></div>
      </div>
    </div>
    <p v-if="isThereUnReadMessage" class="unReadNotice" @click="scrollToBottom">新着メッセージがあります</p>
    <ChatInputArea class="input-area" :roomId="roomId" :user="user"
                   :beforeSendMessage="() => {scrollToBottom();scrollIgnoreFlag = true;}"
                   :afterSendMessage="() => {scrollToBottom(); isThereUnReadMessage=false}"/>
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
  height: calc(100dvh - 80px); /* ヘッダーの高さ*/

  overflow: hidden;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  height: 50px;
  border-bottom: gray 1px solid;
  font-size: 1.8em;
  font-weight: bold;
}

.chatroom-viewport {
  flex-grow: 0;
  top: 0;
  left: 0;
  height: auto;
  overflow-y: scroll;

  /*-ms-overflow-style: none;*/
  /*scrollbar-width: none;*/
}

.message-top {
  text-align: center;
  margin-top: 10px;
  background: var(--background-color);
  color: gray;
  padding: 5px;

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

.unReadNotice {
  text-align: right;
  background: var(--background-color);
  color: gray;
  padding: 5px;
  cursor: pointer;
}
</style>
