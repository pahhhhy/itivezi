<script lang="ts" setup>
import type { ChatFile, ChatMessage } from '@/types/chat/chat'
import { serverTimestamp } from 'firebase/database'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useChatMessageHook } from '@/utils/chat/useChatMessageHook'
import type { User } from 'firebase/auth'

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

const { roomId, user } = defineProps<{
  roomId: string
  user: User
}>()

const { messages, isEnd, checkUpdateLastReadAt, sendMessage, undoMessage, readMoreMessages } =
  useChatMessageHook(roomId, user, () => {})
const message = ref<string>('')
const sendMessageCallback = async () => {
  // 画像をアップロード
  let files: ChatFile[] = []
  if (rawAttachmentFiles.value.length) {
    const fileUploadResult = await fileUpload(rawAttachmentFiles.value)
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
  rawAttachmentFiles.value = []
  attachmentFilesAsDataUrl.value = []
}

// file関連の処理
const storage = getStorage()
const rawAttachmentFiles = ref<File[]>([])
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
  rawAttachmentFiles.value = [...rawAttachmentFiles.value, ...Array.from(files)]
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
      // 回避するためにエラーを配列に収集するなど、異なるエラーハンドリングを検討してください
    }
  }

  return uploadedChatFiles
}
// fileを削除する処理
const deleteFile = (index: number): void => {
  // rawAttachmentFilesとattachmentFilesAsDataUrlから削除
  rawAttachmentFiles.value = rawAttachmentFiles.value.filter((_, i) => i !== index)
  attachmentFilesAsDataUrl.value = attachmentFilesAsDataUrl.value.filter((_, i) => i !== index)
}
</script>
<template>
  <div>
    <div class="preview">
      <!--        ファイル関連-->

      <div v-for="(url, index) in attachmentFilesAsDataUrl" :key="index" class="image-preview">
        <!--          削除ボタン-->
        <button @click="deleteFile(index)" class="image-delete">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path
              d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
            />
          </svg>
        </button>
        <img
          v-if="mediaType(rawAttachmentFiles[index]) === 'image'"
          :src="url"
          alt="attached file"
        />
      </div>
    </div>

<!--    ここからインプットフィールド-->
    <div>
      <label for="img-input">画像</label>
      <input
        type="file"
        accept="image/*"
        multiple
        @change="onFileChange($event as HTMLInputEvent | DragEvent)"
        id="img-input"
      />
    </div>
    <div>
      <label for="file-input">ファイル</label>
      <input
        type="file"
        multiple
        @change="onFileChange($event as HTMLInputEvent | DragEvent)"
        id="file-input"
      />
    </div>
    <textarea type="text" v-model="message" placeholder="メッセージを入力してください" />
    <button @click="sendMessageCallback()">送信</button>
  </div>
</template>
<style scoped>
p {
  margin: 0;
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
  margin-top: 24px;
  padding-top: 4px;
  border-top: 1px solid;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: end;
  flex-wrap: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
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
</style>
