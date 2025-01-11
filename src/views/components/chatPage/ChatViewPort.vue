<script lang="ts" setup>

import ChatMessageCard from "@/views/components/chatPage/ChatMessageCard.vue";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {useUserDataStore} from "@/stores/userPublicData";
import type {useChatMessageHook} from "@/utils/chat/useChatMessageHook";

interface Props {
  chatMessageHook: ReturnType<typeof useChatMessageHook>,
  userid: string,
  setIsThereUnReadMessage: (value: boolean) => void
}

const {chatMessageHook, userid, setIsThereUnReadMessage} = defineProps<Props>()
const {messages, isEnd, readMoreMessages} = chatMessageHook;

type Emits = (event: 'reachedBottom') => () => void
const emit = defineEmits<Emits>();

const chatroomViewport = ref<null | HTMLElement>(null);
const chatMessagesContainer = ref<null | HTMLElement>(null);
const oldChatMessagesContainerHeight = ref<number>(0);
const oldScrollTop = ref<number>(0);
const didInitialScroll = ref<boolean>(false);
const {usersPublicData} = useUserDataStore();
const loadOldMessagesFlag = ref<boolean>(false);
const isBottomMessageInView = ref(false);
const refTop = ref<HTMLElement | null>(null);
const refBottom = ref<HTMLElement | null>(null);
const refMessages = ref<HTMLElement[] | null>(null);
const selectedContextMenuMessageId = ref<string | null>(null);


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
        loadOldMessagesFlag.value = false
        chatMessagesContainer.value!.scrollTop += 10
      })
    }
  })
})
const bottomObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    isBottomMessageInView.value = entry.isIntersecting
    if (entry.isIntersecting) {
      emit('reachedBottom')
    }

  })
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
})

watch(
    () => refMessages.value?.length,
    () => {
      if (isBottomMessageInView.value && didInitialScroll.value) {
        scrollToBottom()
      } else if (!loadOldMessagesFlag.value) {
        setIsThereUnReadMessage(true);
      }
    }
)

const scrollToBottom = () => {
  if (!chatroomViewport.value) return;
  chatroomViewport.value.scrollTop = chatroomViewport.value.scrollHeight; // スクロール位置を最下部に設定
}

defineExpose({ // scrollToBottomを外部から呼べるようにする
  scrollToBottom
})


</script>
<template>
  <!--    表示領域-->
  <div ref="chatroomViewport" class="chatroom-viewport">
    <div v-if="messages" ref="chatMessagesContainer">
      <p v-if="isEnd" class="message-top">一番上まで読み込みました</p>
      <div ref="refTop"></div>
      <div
          v-for="message in messages"
          :key="message.messageId"
          ref="refMessages"
          style="margin-top: 20px"
      >
        <ChatMessageCard
            v-if="usersPublicData && usersPublicData[message.senderUid]"
            :message="message"
            :onContextMenu="
              (e: MouseEvent) => {
                selectedContextMenuMessageId = message.messageId
              }
            "
            :selectedContextMenuMessageId="selectedContextMenuMessageId"
            :senderPublicData="usersPublicData[message.senderUid]"
            :userId="userid"
            @closeContextMenu="selectedContextMenuMessageId = null"
        />
      </div>
      <div ref="refBottom" style="margin-bottom: 10px"></div>
    </div>
  </div>
</template>
<style scoped>

.chatroom-viewport {
  height: auto;
  top: 0;
  left: 0;
  overflow-y: scroll;
  flex-grow: 1;

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.message-top {
  margin-top: 10px;
  padding: 5px;
  text-align: center;
  color: gray;
  background: var(--background-color);
}


.message-container {
  max-width: 80%;
  display: flex;
  flex-direction: row;

  margin: 0 10px;
  padding: 0 5px;
  gap: 10px;
}

.my-message {
  flex-direction: row-reverse;
  align-self: flex-end;
  margin-left: auto;
}

.other-message {
  align-self: flex-start;
  margin-right: auto;
}

.message-icon {
  height: 30px;
  display: flex;
  align-items: start;
  margin-top: 1em;
}

.message-icon img {
  height: 30px;
  width: 30px;
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

.message-text {
  padding: 10px;
  border-radius: 20px;
}

.my-message .message-text,
.my-message .message-attached {
  background-color: var(--sub-color);
  border-radius: 20px;
}

.other-message .message-text,
.other-message .message-attached {
  background-color: var(--background-color);
  border-radius: 20px;
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
    height: 100%;
    width: fit-content;
    z-index: 1;
    display: grid;
    padding: 0 20px 0 48px;
    text-align: center;
    text-decoration: none;
    color: var(--text-color);
    place-content: center;
  }
}
</style>