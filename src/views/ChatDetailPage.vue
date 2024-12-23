<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useChatMessageHook } from '@/utils/chat/useChatMessageHook'
import type { User } from 'firebase/auth'
import { useUserDataStore } from '@/stores/userPublicData'
import { RouterLink } from 'vue-router'
import { useChatRoomStore } from '@/stores/chatRoom'
import ChatMessageCard from '@/views/components/chatPage/ChatMessageCard.vue'
import ChatInputArea from '@/views/ChatInputArea.vue'
import { collectRoomName } from '@/utils/chat/chat'
import SlideMenu from '@/views/components/common/slideMenu.vue'

const { user } = defineProps<{
  user: User
}>()
const userid = ref<string>(user.uid)
// piniaのuseUserStoreから登場ユーザーをすべて取得
const { getUserPublicData, usersPublicData } = useUserDataStore()
const { currentRoom } = useChatRoomStore()
const roomId = currentRoom?.roomId || ''
provide('user', user)
provide('roomId', roomId)
const { messages, isEnd, checkUpdateLastReadAt, readMoreMessages } = useChatMessageHook(
  roomId,
  user,
  (data) => {
    // onMessageUpdatedのコールバック
    // dataは{messageId: ChatMessage}の形式

    const allMessageSenders = Object.values(data).map((message) => message.senderUid)
    const uniqueMessageSenders = Array.from(new Set(allMessageSenders))
    uniqueMessageSenders.forEach((uid: string) => {
      getUserPublicData(uid)
    })

    checkUpdateLastReadAt() // ChatDetailPageからのみ呼び出すことで表示されていることが保証される
  }
)
const chatroomViewport = ref<null | HTMLElement>(null)
const chatMessagesContainer = ref<null | HTMLElement>(null)
const oldChatMessagesContainerHeight = ref<number>(0)
const oldScrollTop = ref<number>(0)
const didInitialScroll = ref<boolean>(false)
const scrollIgnoreFlag = ref<boolean>(false)
const loadOldMessagesFlag = ref<boolean>(false)
const isThereUnReadMessage = ref(false) // スクロール中に新しいメッセージが追加されてかつまだ表示されていないかどうかを格納するref
const isBottomMessageInView = ref(false)
const refTop = ref<HTMLElement | null>(null)
const refBottom = ref<HTMLElement | null>(null)
const refMessages = ref<HTMLElement[] | null>(null)

const selectedContextMenuMessageId = ref<string | null>(null)

const topObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (
      entry.isIntersecting &&
      !isEnd.value &&
      didInitialScroll.value &&
      chatMessagesContainer.value
    ) {
      oldScrollTop.value = chatMessagesContainer.value?.scrollTop || 0
      oldChatMessagesContainerHeight.value = chatMessagesContainer.value.scrollHeight
      loadOldMessagesFlag.value = true
      readMoreMessages().then(() => {
        // chatMessagesContainer.value!.scrollTop = chatMessagesContainer.value!.scrollHeight - oldChatMessagesContainerHeight.value + oldScrollTop.value;
        loadOldMessagesFlag.value = false
        chatMessagesContainer.value!.scrollTop += 10
      })
    }
  })
})
const bottomObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    isBottomMessageInView.value = entry.isIntersecting
    if (isThereUnReadMessage.value) isThereUnReadMessage.value = false // もし一番下に来たときにまだ未読メッセージフラグが立っているならば折る
  })
})

const heightObserver = new ResizeObserver((entries) => {
  if (!didInitialScroll.value || !chatMessagesContainer.value) return

  if (scrollIgnoreFlag.value) {
    scrollIgnoreFlag.value = false
    return
  }

  if (oldChatMessagesContainerHeight.value === 0) {
    oldChatMessagesContainerHeight.value = chatMessagesContainer.value.scrollHeight
  } else {
    if (isThereUnReadMessage.value) return
    const diff = chatMessagesContainer.value.scrollHeight - oldChatMessagesContainerHeight.value
    chatroomViewport.value!.scrollTop += diff
  }
})

onMounted(() => {
  if (refTop.value) {
    topObserver.observe(refTop.value)
  }
  if (refBottom.value) {
    bottomObserver.observe(refBottom.value)
  }
  if (refMessages.value) {
    refMessages.value.forEach((message) => {
      bottomObserver.observe(message)
    })
  }
  if (chatMessagesContainer.value) {
    // heightObserver.observe(chatMessagesContainer.value);
  }

  // タイミングを調整してスクロールを実行
  setTimeout(() => {
    scrollToBottom()
    didInitialScroll.value = true
  })
})

onUnmounted(() => {
  if (refBottom.value) {
    bottomObserver.unobserve(refBottom.value)
  }
  if (refTop.value) {
    topObserver.unobserve(refTop.value)
  }
  if (refMessages.value) {
    refMessages.value.forEach((message) => {
      bottomObserver.unobserve(message)
    })
  }
  if (chatMessagesContainer.value) {
    // heightObserver.unobserve(chatMessagesContainer.value);
  }
})

watch(
  () => refMessages.value?.length,
  () => {
    if (isBottomMessageInView.value && didInitialScroll.value) {
      scrollToBottom()
    } else {
      if (!loadOldMessagesFlag.value) isThereUnReadMessage.value = true
    }
  }
)

const scrollToBottom = () => {
  if (!chatroomViewport.value) return

  // スクロール位置を最下部に設定
  chatroomViewport.value.scrollTop = chatroomViewport.value.scrollHeight
}

const initialScroll = () => {
  scrollToBottom()
  didInitialScroll.value = true
}
</script>

<template>
  <div class="chatroom-wrapper" v-if="currentRoom">
    <SlideMenu title="wa">
      waa
    </SlideMenu>
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
            <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z" />
          </svg>
        </router-link>
        {{ collectRoomName(currentRoom, userid) }}
      </p>
      <div>
        <button>
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.875 26.25C1.875 26.25 0 26.25 0 24.375C0 22.5 1.875 16.875 11.25 16.875C20.625 16.875 22.5 22.5 22.5 24.375C22.5 26.25 20.625 26.25 20.625 26.25H1.875ZM11.25 15C12.7418 15 14.1726 14.4074 15.2275 13.3525C16.2824 12.2976 16.875 10.8668 16.875 9.375C16.875 7.88316 16.2824 6.45242 15.2275 5.39752C14.1726 4.34263 12.7418 3.75 11.25 3.75C9.75816 3.75 8.32742 4.34263 7.27252 5.39752C6.21763 6.45242 5.625 7.88316 5.625 9.375C5.625 10.8668 6.21763 12.2976 7.27252 13.3525C8.32742 14.4074 9.75816 15 11.25 15Z"
              fill="black"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M25.3125 9.375C25.5611 9.375 25.7996 9.47377 25.9754 9.64959C26.1512 9.8254 26.25 10.0639 26.25 10.3125V13.125H29.0625C29.3111 13.125 29.5496 13.2238 29.7254 13.3996C29.9012 13.5754 30 13.8139 30 14.0625C30 14.3111 29.9012 14.5496 29.7254 14.7254C29.5496 14.9012 29.3111 15 29.0625 15H26.25V17.8125C26.25 18.0611 26.1512 18.2996 25.9754 18.4754C25.7996 18.6512 25.5611 18.75 25.3125 18.75C25.0639 18.75 24.8254 18.6512 24.6496 18.4754C24.4738 18.2996 24.375 18.0611 24.375 17.8125V15H21.5625C21.3139 15 21.0754 14.9012 20.8996 14.7254C20.7238 14.5496 20.625 14.3111 20.625 14.0625C20.625 13.8139 20.7238 13.5754 20.8996 13.3996C21.0754 13.2238 21.3139 13.125 21.5625 13.125H24.375V10.3125C24.375 10.0639 24.4738 9.8254 24.6496 9.64959C24.8254 9.47377 25.0639 9.375 25.3125 9.375Z"
              fill="black"
            />
          </svg>
        </button>
        <button>
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M29.0662 3.63751C29.2414 3.81324 29.3398 4.05125 29.3398 4.29938C29.3398 4.54751 29.2414 4.78552 29.0662 4.96125L27.1106 6.91876L23.3606 3.16876L25.3162 1.21125C25.492 1.0355 25.7304 0.936768 25.979 0.936768C26.2276 0.936768 26.466 1.0355 26.6418 1.21125L29.0662 3.63563V3.63751ZM25.785 8.2425L22.035 4.4925L9.26058 17.2688C9.15738 17.3719 9.0797 17.4978 9.03371 17.6363L7.52433 22.1625C7.49696 22.245 7.49307 22.3335 7.51311 22.4181C7.53314 22.5027 7.57631 22.5801 7.63778 22.6416C7.69926 22.703 7.77662 22.7462 7.86121 22.7662C7.94581 22.7863 8.03431 22.7824 8.11683 22.755L12.6431 21.2456C12.7814 21.2002 12.9072 21.1231 13.0106 21.0206L25.785 8.2425Z"
              fill="black"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1.875 25.3125C1.875 26.0584 2.17132 26.7738 2.69876 27.3012C3.22621 27.8287 3.94158 28.125 4.6875 28.125H25.3125C26.0584 28.125 26.7738 27.8287 27.3012 27.3012C27.8287 26.7738 28.125 26.0584 28.125 25.3125V14.0625C28.125 13.8139 28.0262 13.5754 27.8504 13.3996C27.6746 13.2238 27.4361 13.125 27.1875 13.125C26.9389 13.125 26.7004 13.2238 26.5246 13.3996C26.3488 13.5754 26.25 13.8139 26.25 14.0625V25.3125C26.25 25.5611 26.1512 25.7996 25.9754 25.9754C25.7996 26.1512 25.5611 26.25 25.3125 26.25H4.6875C4.43886 26.25 4.2004 26.1512 4.02459 25.9754C3.84877 25.7996 3.75 25.5611 3.75 25.3125V4.6875C3.75 4.43886 3.84877 4.2004 4.02459 4.02459C4.2004 3.84877 4.43886 3.75 4.6875 3.75H16.875C17.1236 3.75 17.3621 3.65123 17.5379 3.47541C17.7137 3.2996 17.8125 3.06114 17.8125 2.8125C17.8125 2.56386 17.7137 2.3254 17.5379 2.14959C17.3621 1.97377 17.1236 1.875 16.875 1.875H4.6875C3.94158 1.875 3.22621 2.17132 2.69876 2.69876C2.17132 3.22621 1.875 3.94158 1.875 4.6875V25.3125Z"
              fill="black"
            />
          </svg>
        </button>
        <button>
          <svg width="30" height="30" viewBox="0 0 6 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.8125 22.375C5.8125 23.1209 5.51618 23.8363 4.98874 24.3637C4.46129 24.8912 3.74592 25.1875 3 25.1875C2.25408 25.1875 1.53871 24.8912 1.01126 24.3637C0.483816 23.8363 0.1875 23.1209 0.1875 22.375C0.1875 21.6291 0.483816 20.9137 1.01126 20.3863C1.53871 19.8588 2.25408 19.5625 3 19.5625C3.74592 19.5625 4.46129 19.8588 4.98874 20.3863C5.51618 20.9137 5.8125 21.6291 5.8125 22.375ZM5.8125 13C5.8125 13.7459 5.51618 14.4613 4.98874 14.9887C4.46129 15.5162 3.74592 15.8125 3 15.8125C2.25408 15.8125 1.53871 15.5162 1.01126 14.9887C0.483816 14.4613 0.1875 13.7459 0.1875 13C0.1875 12.2541 0.483816 11.5387 1.01126 11.0113C1.53871 10.4838 2.25408 10.1875 3 10.1875C3.74592 10.1875 4.46129 10.4838 4.98874 11.0113C5.51618 11.5387 5.8125 12.2541 5.8125 13ZM5.8125 3.625C5.8125 4.37092 5.51618 5.08629 4.98874 5.61374C4.46129 6.14118 3.74592 6.4375 3 6.4375C2.25408 6.4375 1.53871 6.14118 1.01126 5.61374C0.483816 5.08629 0.1875 4.37092 0.1875 3.625C0.1875 2.87908 0.483816 2.16371 1.01126 1.63626C1.53871 1.10882 2.25408 0.8125 3 0.8125C3.74592 0.8125 4.46129 1.10882 4.98874 1.63626C5.51618 2.16371 5.8125 2.87908 5.8125 3.625Z" fill="black"/>
          </svg>

        </button>
      </div>
    </div>

    <div class="chatroom-viewport" ref="chatroomViewport">
      <div v-if="messages" ref="chatMessagesContainer">
        <p v-if="isEnd" class="message-top">一番上まで読み込みました</p>
        <div ref="refTop"></div>
        <div
          v-for="message in messages"
          :key="message.messageId"
          style="margin-top: 20px"
          ref="refMessages"
        >
          <ChatMessageCard
            v-if="usersPublicData && usersPublicData[message.senderUid]"
            :userId="userid"
            :message="message"
            :senderPublicData="usersPublicData[message.senderUid]"
            :selectedContextMenuMessageId="selectedContextMenuMessageId"
            :onContextMenu="
              (e: MouseEvent) => {
                selectedContextMenuMessageId = message.messageId
              }
            "
            @closeContextMenu="selectedContextMenuMessageId = null"
          />
        </div>
        <div ref="refBottom" style="margin-bottom: 10px"></div>
      </div>
    </div>
    <p v-if="isThereUnReadMessage" class="unReadNotice" @click="scrollToBottom">
      新着メッセージがあります
    </p>
    <ChatInputArea
      class="input-area"
      :roomId="roomId"
      :user="user"
      :beforeSendMessage="
        () => {
          scrollToBottom()
          scrollIgnoreFlag = true
        }
      "
      :afterSendMessage="
        () => {
          scrollToBottom()
          isThereUnReadMessage = false
        }
      "
    />
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

  button {
    background: none;
    border: none;
  }
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
