<script lang="ts" setup>
import type { ChatFile, ChatMessage } from '@/types/chat/chat'
import { serverTimestamp } from 'firebase/database'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useChatMessageHook } from '@/utils/chat/useChatMessageHook'
import type { User } from 'firebase/auth'
import type HTMLInputEvent from '@/types/common/HTMLInputEvent'
import SmallTextInputField from '@/views/components/common/SmallTextInputField.vue'

const { roomId, user, beforeSendMessage, afterSendMessage } = defineProps<{
  roomId: string
  user: User
  beforeSendMessage?: () => void
  afterSendMessage?: () => void
}>()

const { sendMessage } = useChatMessageHook(roomId, user, () => {})

const sendMessageCallback = async () => {
  if (!message.value && !attachmentFiles.value.length) return
  isSending.value = true
  if (beforeSendMessage) beforeSendMessage()
  const createdAt = serverTimestamp()
  // 画像をアップロード
  let files: ChatFile[] = []

  if (attachmentFiles.value.length) {
    const fileUploadResult = await fileUpload(attachmentFiles.value)
    files = Object.values(fileUploadResult)

    // ファイルがある場合は1つ1メッセージとしてアップロードする
    for (const file of files) {
      const messageData: ChatMessage = {
        senderUid: user.uid,
        messageId: '',
        message: '',
        attachedFiles: {
          [file.fileId]: file
        },
        roomId,
        createdAt
      }
      await sendMessage(messageData)
    }
  }

  // 文字メッセージをアップロード
  if (message.value) {
    const messageData: ChatMessage = {
      senderUid: user.uid,
      messageId: '',
      message: message.value,
      roomId,
      createdAt
    }
    await sendMessage(messageData)
  }

  message.value = ''
  attachmentFiles.value = []
  attachmentFilesAsDataUrl.value = []
  if (afterSendMessage) afterSendMessage()
  isSending.value = false
}

// file関連の処理
const storage = getStorage()
const attachmentFiles = ref<File[]>([])
const attachmentFilesAsDataUrl = ref<string[]>([]) // プレビューのためにファイルをDataUrlに変換したものを格納

const onFileChange = (e: HTMLInputEvent | DragEvent) => {
  let files = (e as HTMLInputEvent).target.files // ファイルがinputから選択された場合
  if (!files) {
    // ファイルがドラッグ&ドロップされた場合
    let dataTransfer = e as DragEvent
    if (!dataTransfer) return
    files = dataTransfer.dataTransfer?.files || null
  }

  if (!files || !files.length || !e.target) return // ファイルが選択されていない場合は何もしない

  // 基準に適合していないファイルが含まれていたら全て弾く
  if (Array.from(files).some((file) => !checkFile(file))) {
    alert('ファイルサイズの上限は5MBです')
    return
  }

  // rawAttachmentFilesにファイルを追加
  attachmentFiles.value = [...attachmentFiles.value, ...Array.from(files)]
  const eventFiles = Array.from(files) // FileListをArrayに変換
  if (eventFiles) {
    // ファイルが選択されている場合
    for (const element of eventFiles) {
      // ファイルの数だけループ
      const file = element // ファイルを取得
      const reader = new FileReader() // ファイルを読み込むためのFileReaderを作成
      reader.onload = (e) => {
        // readAsDataURLのコールバックを登録
        if (e.target === null) return // e.targetがnullの場合は何もしない
        const result = e.target.result // ファイルの読み込み結果を取得
        if (typeof result === 'string') {
          // 読み込んだファイルが文字列で返ってきた(読み込めた)場合
          attachmentFilesAsDataUrl.value.push(result) // 読み込んだファイルをattachmentFileUrlsに追加
        }
      }
      reader.readAsDataURL(file) // ファイル読み込み実行
    }
  }
}

// ファイルのサイズをチェック
const checkFile = (file: File) => {
  const SIZE_LIMIT = 5 * 1024 * 1024 // 5MB
  return file.size <= SIZE_LIMIT
}

const mediaType = (file: File) => {
  const extension = file.name.split('.').pop()
  if (
    extension === 'jpg' ||
    extension === 'jpeg' ||
    extension === 'png' ||
    extension === 'gif' ||
    extension === 'svg' ||
    extension === 'webp' ||
    extension === 'JPG' ||
    extension === 'JPEG' ||
    extension === 'PNG' ||
    extension === 'GIF' ||
    extension === 'SVG' ||
    extension === 'WEBP'
  ) {
    return 'image'
  }
  if (extension === 'mp4' || extension === 'webm' || extension === 'MP4' || extension === 'WEBM') {
    return 'video'
  }
  if (
    extension === 'mp3' ||
    extension === 'wav' ||
    extension === 'ogg' ||
    extension === 'MP3' ||
    extension === 'WAV' ||
    extension === 'OGG'
  ) {
    return 'audio'
  }
  return 'file'
}

// fileをstorageにまで上げる処理
const fileUpload = async (files: File[]): Promise<{ [fileId: string]: ChatFile }> => {
  if (!files) return {} // ファイルがない場合でもオブジェクトを返します

  const uploadedChatFiles: { [fileId: string]: ChatFile } = {}

  for (const element of files) {
    const file = element
    if (!checkFile(file)) {
      continue // 無効なファイルをエラーなしでスキップ
    }

    const fileId = `${uuidv4()}`
    const chatStorageRef = storageRef(storage, `Chat/${roomId}/${fileId}`)

    const metadata = {
      contentType: file.type
    }

    try {
      const snapshot = await uploadBytes(chatStorageRef, file, metadata)
      const url = await getDownloadURL(snapshot.ref)
      uploadedChatFiles[fileId] = {
        fileId,
        messageId: '', // アップロード時に適用
        fileName: file.name,
        fileUrl: url,
        fileType: mediaType(file),
        createdAt: serverTimestamp()
      } as ChatFile
    } catch (error) {
      console.error('ファイルのアップロード中にエラーが発生しました: ', error)
    }
  }

  return uploadedChatFiles
}
// fileを削除する処理
const deleteFile = (index: number): void => {
  // rawAttachmentFilesとattachmentFilesAsDataUrlから削除
  attachmentFiles.value = attachmentFiles.value.filter((_, i) => i !== index)
  attachmentFilesAsDataUrl.value = attachmentFilesAsDataUrl.value.filter((_, i) => i !== index)
}

const message = ref<string>('')
const isSending = ref<boolean>(false)
</script>
<template>
  <div>
    <div v-if="attachmentFiles.length" class="preview">
      <!--        ファイル関連-->
      <div v-for="(url, index) in attachmentFilesAsDataUrl" :key="index">
        <div class="image-preview" v-if="mediaType(attachmentFiles[index]) === 'image'">
          <!--          削除ボタン-->
          <button @click="deleteFile(index)" class="delete">
            <IconDelete />
          </button>
          <img
            v-if="mediaType(attachmentFiles[index]) === 'image'"
            :src="url"
            alt="attached file"
          />
        </div>
        <div v-else-if="mediaType(attachmentFiles[index]) === 'video'" class="video-preview">
          <video controls>
            <source :src="url" type="video/mp4" />
            このブラウザはvideoタグをサポートしていません。
          </video>
          <button @click="deleteFile(index)" class="delete">
            <IconDelete />
          </button>
        </div>
        <div v-else-if="mediaType(attachmentFiles[index]) === 'audio'" class="audio-preview">
          <audio controls>
            <source :src="url" type="audio/mpeg" />
            このブラウザはaudioタグをサポートしていません。
          </audio>
          <button @click="deleteFile(index)" class="delete">
            <IconDelete />
          </button>
        </div>
        <div v-else class="file-preview">
          <IconFile />
          <a :href="url" target="_blank" download>{{ attachmentFiles[index].name }}</a>
          <button @click="deleteFile(index)" class="delete">
            <IconDelete />
          </button>
        </div>
      </div>
    </div>

    <!--    ここからインプットフィールド-->
    <SmallTextInputField
      v-model:message="message"
      v-model:isSending="isSending"
      v-model:attachmentFiles="attachmentFiles"
      @fileChange="onFileChange"
      @send="sendMessageCallback"
      placeholder="メッセージを入力"
    />
  </div>
</template>
<style scoped>
p {
  margin: 0;
}

button {
  background: none;
  border: none;
}

.message-icon img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.message-header div {
  margin-left: 10px;
}

.preview {
  max-height: 512px;
  margin-top: 12px;
  padding-top: 4px;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: end;
  flex-wrap: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  width: 100%;
}

.delete {
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  transform: translateX(100%);

  background: none;
  color: red;
  width: 36px;
  height: 36px;
}

.image-preview {
  position: relative;
  margin-right: 36px;

  img {
    max-width: 256px;
    max-height: 256px;
  }
}

.video-preview {
  position: relative;
  margin-right: 36px;

  video {
    max-width: 256px;
    max-height: 256px;
  }
}

.audio-preview {
  position: relative;
  margin-right: 36px;

  audio {
    max-width: 256px;
    max-height: 256px;
  }
}

.file-preview {
  position: relative;
  margin-right: 36px;
  height: 64px;

  a {
    color: var(--text-color);
    text-decoration: none;
  }
}

textarea {
  /* textareaは自動拡張させる */
  resize: none;
  width: 100%;
  height: 100%;
  min-height: 40px;
  max-height: 160px;
  field-sizing: content;
  border-radius: 20px;
  padding: 0.4em 1em;

  & [disabled] {
    background-color: #f0f0f0;
  }
}

.send-button[disabled] > svg > path {
  fill: #ccc;
}
</style>
