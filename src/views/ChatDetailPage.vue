<script setup lang="ts">
import { ref } from 'vue'
import { useChatMessageHook } from '@/utils/chat/useChatMessageHook'
import type { ChatMessage } from '@/types/chat/chat'
import { serverTimestamp } from 'firebase/database'
import type { User } from 'firebase/auth'
import { formatServerTimestamp } from '@/utils/database'
import { useUserDataStore } from '@/stores/userPublicData'
import { RouterLink } from 'vue-router'
import type { UserPublicData } from '@/types/common/userPublicData'
import { getStorage, ref as storageRef, uploadBytes } from 'firebase/storage'

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

const { user, roomId } = defineProps<{
  user: User
  roomId: string
}>()
const userid = ref<string>(user.uid)

// piniaのuseUserStoreから登場ユーザーをすべて取得
const { getUserPublicData } = useUserDataStore()

const usersPublicData = ref<Record<string, UserPublicData> | undefined>(undefined)

const { messages, sendMessage } = useChatMessageHook(roomId, (data) => {
  // dataは{messageId: ChatMessage}の形式
  const allMessageSenders = Object.values(data).map((message) => message.senderUid)
  const uniqueMessageSenders = Array.from(new Set(allMessageSenders))
  uniqueMessageSenders.forEach((uid: string) => {
    getUserPublicData(uid).then((data) => {
      if (!usersPublicData.value) usersPublicData.value = {}
      if (!usersPublicData.value[uid] && data)
        usersPublicData.value = {
          ...usersPublicData.value,
          [uid]: data
        }
    })
  })
})

const sendMessageCallback = () => {
  const createdAt = serverTimestamp()
  const messageData: ChatMessage = {
    senderUid: userid.value,
    messageId: '',
    message: message.value,
    fileUrls: attachmentFileUrls.value,
    roomId,
    createdAt
  }
  sendMessage(messageData)
}

const storage = getStorage()
const message = ref<string>('')
const attachmentFileUrls = ref<string[]>([])
const tmpFiles = ref<File>()

const onFileChange = (e: HTMLInputEvent | DragEvent) => {
  let files = (e as HTMLInputEvent).target.files
  if (!files) {
    let dataTransfer = (e as DragEvent)
    files =  (e as DragEvent).dataTransfer.files
  }

  if (!files.length) return

  console.log(e.target?.)
  return;
  if (!e.target) return
  const eventFiles = e.target.files
  if (eventFiles) {
    for (let i = 0; i < eventFiles.length; i++) {
      const file = eventFiles[i]
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target === null) return
        const result = e.target.result
        if (typeof result === 'string') {
          attachmentFileUrls.value.push(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }
}

//   fileをstorageにまで上げる処理
function fileUpload(props: any) {
  //アップロードしたい画像の情報を取得。
  const file = props.target.files[0]
  //画像ファイルのURLを取得。
  const img_url = URL.createObjectURL(file)
  //"files"は③で作成したフォルダ名
  //Firebase storageに画像ファイルを送信。
  const chatStorageRef = storageRef(storage, 'chat/' + file.name)

  //Firebaseにデータを適切に送るために必要なコード
  uploadBytes(chatStorageRef, file).then((snapshot) => {
    console.log('blobかfileをアップロード', snapshot)
  })
}
</script>

<template>
  <div>
    <h1>chat detail</h1>
    <router-link to="/chat">&lg;戻る</router-link>
    <div class="chat">
      <div v-if="messages">
        <div v-for="message in messages" :key="message.messageId" style="margin-top: 20px">
          <div
            v-if="usersPublicData && usersPublicData[message.senderUid]"
            class="message-container"
          >
            <div class="message-header">
              <img :src="usersPublicData[message.senderUid].iconURL" alt="user icon" />
              <div>{{ usersPublicData[message.senderUid].userName }}</div>
              <div>{{ formatServerTimestamp(message.createdAt) }}</div>
            </div>

            <div class="message-content">{{ message.message }}</div>
          </div>
        </div>
      </div>
      <div>
        <p>{{ attachmentFileUrls }}</p>
        <input type="file" multiple @change="onFileChange($event)" />
        <input type="text" v-model="message" placeholder="メッセージを入力してください" />
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