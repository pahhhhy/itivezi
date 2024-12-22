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

const { roomId, user, beforeSendMessage, afterSendMessage } = defineProps<{
  roomId: string
  user: User
  beforeSendMessage?: () => void
  afterSendMessage?: () => void
}>()

const { sendMessage} = useChatMessageHook(roomId, user, () => {});
const message = ref<string>('')
const isSending = ref<boolean>(false);

const sendMessageCallback = async () => {
  if (!message.value) return
  isSending.value = true
  if (beforeSendMessage) beforeSendMessage();
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
  if (afterSendMessage) afterSendMessage();
  isSending.value = false
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


const inputImg = ref<null | HTMLInputElement>(null);
const inputFile = ref<null | HTMLInputElement>(null);
</script>
<template>
  <div>
    <div v-if="rawAttachmentFiles.length" class="preview">
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
    <div class="input-area">
      <div>
<!--        <label for="img-input"></label>-->
        <input
          type="file"
          accept="image/*"
          multiple
          @change="onFileChange($event as HTMLInputEvent | DragEvent)"
          id="img-input"
          ref="inputImg"
          style="display: none;"
        />
        <button type="button" @click="inputImg!.click();">
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <rect x="0.576416" y="0.413818" width="24" height="24" fill="url(#pattern0_505_838)"/>
            <defs>
              <pattern id="pattern0_505_838" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlink:href="#image0_505_838" transform="scale(0.00390625)"/>
              </pattern>
              <image id="image0_505_838" width="256" height="256" xlink:href="data:image/png;base64,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"/>
            </defs>
          </svg>
        </button>
      </div>
      <div>
        <input
          type="file"
          multiple
          @change="onFileChange($event as HTMLInputEvent | DragEvent)"
          id="file-input"
          ref="inputFile"
          style="display: none;"
        />
        <button type="button" @click="inputFile!.click();">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_505_834)">
              <path d="M11.2537 10.3125C11.2537 11.0584 10.9573 11.7738 10.4299 12.3012C9.90245 12.8287 9.18708 13.125 8.44116 13.125C7.69524 13.125 6.97987 12.8287 6.45242 12.3012C5.92498 11.7738 5.62866 11.0584 5.62866 10.3125C5.62866 9.56658 5.92498 8.85121 6.45242 8.32376C6.97987 7.79632 7.69524 7.5 8.44116 7.5C9.18708 7.5 9.90245 7.79632 10.4299 8.32376C10.9573 8.85121 11.2537 9.56658 11.2537 10.3125Z" fill="black"/>
              <path d="M3.75366 1.875C2.7591 1.875 1.80527 2.27009 1.10201 2.97335C0.39875 3.67661 0.00366211 4.63044 0.00366211 5.625V24.375C0.00366211 25.3696 0.39875 26.3234 1.10201 27.0266C1.80527 27.7299 2.7591 28.125 3.75366 28.125H26.2537C27.2482 28.125 28.2021 27.7299 28.9053 27.0266C29.6086 26.3234 30.0037 25.3696 30.0037 24.375V5.625C30.0037 4.63044 29.6086 3.67661 28.9053 2.97335C28.2021 2.27009 27.2482 1.875 26.2537 1.875H3.75366ZM26.2537 3.75C26.7509 3.75 27.2279 3.94754 27.5795 4.29917C27.9311 4.65081 28.1287 5.12772 28.1287 5.625V17.8125L21.0468 14.1619C20.871 14.0738 20.6719 14.0432 20.4777 14.0745C20.2836 14.1058 20.1042 14.1974 19.9649 14.3363L13.0087 21.2925L8.02116 17.97C7.84109 17.8501 7.62509 17.7962 7.4098 17.8174C7.1945 17.8386 6.99316 17.9336 6.83991 18.0863L1.87866 22.5V5.625C1.87866 5.12772 2.07621 4.65081 2.42784 4.29917C2.77947 3.94754 3.25638 3.75 3.75366 3.75H26.2537Z" fill="black"/>
            </g>
            <defs>
              <clipPath id="clip0_505_834">
                <rect width="30" height="30" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
      <textarea type="text" v-model="message" placeholder="メッセージを入力" :disabled="isSending"></textarea>
      <button class="send-button" @click="sendMessageCallback()" type="button" :disabled="isSending || (!message && !rawAttachmentFiles.length)">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30.2735 0.278526C30.4057 0.410962 30.4962 0.579328 30.5335 0.76271C30.5709 0.946092 30.5535 1.13641 30.4836 1.31002L19.3684 29.0972C19.2704 29.3419 19.1068 29.5549 18.8957 29.7126C18.6845 29.8704 18.4339 29.9668 18.1714 29.9913C17.909 30.0158 17.6449 29.9674 17.4081 29.8514C17.1714 29.7355 16.9713 29.5565 16.8298 29.3341L10.7592 19.7928L1.21796 13.7223C0.995075 13.5809 0.815584 13.3807 0.69929 13.1437C0.582995 12.9068 0.534419 12.6423 0.558921 12.3795C0.583423 12.1167 0.680051 11.8658 0.838142 11.6544C0.996233 11.4431 1.20964 11.2795 1.45482 11.1818L29.242 0.0703176C29.4156 0.000428871 29.606 -0.0169149 29.7893 0.0204407C29.9727 0.0577962 30.1411 0.148205 30.2735 0.280436V0.278526ZM12.6656 19.235L17.9396 27.5213L26.9804 4.92023L12.6656 19.235ZM25.6299 3.56974L3.0288 12.6106L11.317 17.8826L25.6299 3.56974Z" fill="#434343"/>
        </svg>
      </button>
    </div>
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
