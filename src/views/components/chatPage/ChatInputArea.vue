<script lang="ts" setup>
import type { ChatFile, ChatMessage } from '@/types/chat/chat'
import { serverTimestamp } from 'firebase/database'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useChatMessageHook } from '@/utils/chat/useChatMessageHook'
import type { User } from 'firebase/auth'
import type HTMLInputEvent from "@/types/common/HTMLInputEvent";
import SmallTextInputField from "@/views/components/common/SmallTextInputField.vue";



const { roomId, user, beforeSendMessage, afterSendMessage } = defineProps<{
  roomId: string
  user: User
  beforeSendMessage?: () => void
  afterSendMessage?: () => void
}>()

const { sendMessage} = useChatMessageHook(roomId, user, () => {});

const sendMessageCallback = async () => {
  if (!message.value) return
  isSending.value = true
  if (beforeSendMessage) beforeSendMessage();
  // 画像をアップロード
  let files: ChatFile[] = []
  if (attachmentFiles.value.length) {
    const fileUploadResult = await fileUpload(attachmentFiles.value)
    files = Object.values(fileUploadResult)
  }

  const createdAt = serverTimestamp()
  const messageData: ChatMessage = {
    senderUid: user.uid,
    messageId: '',
    message: message.value,
    attachedFiles: files.reduce(
      (acc, file) => {
        acc[file.fileId] = file
        return acc
      },
      {} as { [fileId: string]: ChatFile }
    ),
    roomId,
    createdAt
  }
  await sendMessage(messageData)
  message.value = ''
  attachmentFiles.value = []
  attachmentFilesAsDataUrl.value = []
  if (afterSendMessage) afterSendMessage();
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
    for (let i = 0; i < eventFiles.length; i++) {
      // ファイルの数だけループ
      const file = eventFiles[i] // ファイルを取得
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
  if (file.size > SIZE_LIMIT) {
    return false
  }

  return true
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

  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    if (!checkFile(file)) {
      continue // 無効なファイルをエラーなしでスキップ
    }

    const fileId = `${uuidv4()}`
    const chatStorageRef = storageRef(storage, `chat/${roomId}/${fileId}`)

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



const inputImg = ref<null | HTMLInputElement>(null);
const inputFile = ref<null | HTMLInputElement>(null);
const message = ref<string>('')
const isSending = ref<boolean>(false);
</script>
<template>
  <div>
    <div v-if="attachmentFiles.length" class="preview">
      <!--        ファイル関連-->
      <div v-for="(url, index) in attachmentFilesAsDataUrl" :key="index" class="image-preview">
        <!--          削除ボタン-->
        <button @click="deleteFile(index)" class="image-delete">
          <IconDelete />
        </button>
        <img
          v-if="mediaType(attachmentFiles[index]) === 'image'"
          :src="url"
          alt="attached file"
        />
      </div>
    </div>

    <!--    ここからインプットフィールド-->
    <SmallTextInputField
        v-model:message="message"
        v-model:isSending="isSending"
        v-model:attachmentFiles="attachmentFiles"
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

.image-preview {
  position: relative;
  margin-right: 36px;

  img {
    max-width: 256px;
  }

  .image-delete {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    transform: translateX(100%);
    border: var(--text-color) 1px solid;
    border-left: none;
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
    background: none;
    color: red;
    width: 36px;
    height: 36px;
  }
}


.input-area {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: max-content;
  margin: 0 0  16px;
  padding-top: 16px;
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
  padding: .4em 1em;



  & [disabled] {
    background-color: #f0f0f0;
  }
}

.send-button[disabled] > svg > path {
  fill: #ccc;
}
</style>
