<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {useChatMessageHook} from '@/utils/chat/useChatMessageHook'
import type {ChatFile, ChatMessage} from '@/types/chat/chat'
import {serverTimestamp} from 'firebase/database'
import type {User} from 'firebase/auth'
import {formatServerTimestamp} from '@/utils/database'
import {useUserDataStore} from '@/stores/userPublicData'
import {RouterLink} from 'vue-router'
import type {UserPublicData} from '@/types/common/userPublicData'
import {v4 as uuidv4} from 'uuid';
import {getDownloadURL, getStorage, ref as storageRef, uploadBytes} from 'firebase/storage'

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

const {user, roomId} = defineProps<{
  user: User
  roomId: string
}>()
const userid = ref<string>(user.uid)

// piniaのuseUserStoreから登場ユーザーをすべて取得
const {getUserPublicData} = useUserDataStore();

const usersPublicData = ref<Record<string, UserPublicData> | undefined>(undefined) // undefinedにしているのは、getUserPublicDataが非同期で呼ばれるため
let unmounted = false
onMounted(() => {
  unmounted = false
})
onUnmounted(() => {
  unmounted = true
})
const {messages, isEnd, checkUpdateLastReadAt, sendMessage, undoMessage, readMoreMessages} = useChatMessageHook(roomId, user, (data) => {
  // onMessageUpdatedのコールバック
  // dataは{messageId: ChatMessage}の形式
  if (unmounted) return
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
  checkUpdateLastReadAt(); // ChatDetailPageからのみ呼び出すことで表示されていることが保証される

})

const sendMessageCallback = async () => {
  // 画像をアップロード
  let files: ChatFile[] = []
  if (rawAttachmentFiles.value.length) {
    const fileUploadResult = await fileUpload(rawAttachmentFiles.value)
    files = Object.values(fileUploadResult)
  }

  const createdAt = serverTimestamp();
  const messageData: ChatMessage = {
    senderUid: userid.value,
    messageId: '',
    message: message.value,
    attachedFiles: files.reduce((acc, file) => {
        acc[file.fileId] = file;
        return acc;
    }, {} as { [fileId: string]: ChatFile }),
    roomId,
    createdAt
  }
  await sendMessage(messageData);
  message.value = ''
  rawAttachmentFiles.value = []
  attachmentFilesAsDataUrl.value = []

}


// file関連の処理
const storage = getStorage();
const message = ref<string>('');
const rawAttachmentFiles = ref<File[]>([]);
const attachmentFilesAsDataUrl = ref<string[]>([]); // プレビューのためにファイルをDataUrlに変換したものを格納

const onFileChange = (e: HTMLInputEvent | DragEvent) => {
  let files = (e as HTMLInputEvent).target.files  // ファイルがinputから選択された場合
  if (!files) { // ファイルがドラッグ&ドロップされた場合
    let dataTransfer = (e as DragEvent)
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
  rawAttachmentFiles.value = [...rawAttachmentFiles.value, ...Array.from(files)];
  const eventFiles = Array.from(files)  // FileListをArrayに変換
  if (eventFiles) {  // ファイルが選択されている場合
    for (let i = 0; i < eventFiles.length; i++) {  // ファイルの数だけループ
      const file = eventFiles[i]  // ファイルを取得
      const reader = new FileReader()  // ファイルを読み込むためのFileReaderを作成
      reader.onload = (e) => {  // readAsDataURLのコールバックを登録
        if (e.target === null) return  // e.targetがnullの場合は何もしない
        const result = e.target.result  // ファイルの読み込み結果を取得
        if (typeof result === 'string') {  // 読み込んだファイルが文字列で返ってきた(読み込めた)場合
          attachmentFilesAsDataUrl.value.push(result)  // 読み込んだファイルをattachmentFileUrlsに追加
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
  if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'svg' || extension === 'webp') {
    return 'image'
  }
  if (extension === 'mp4' || extension === 'webm' || extension === 'ogg') {
    return 'video'
  }
  if (extension === 'mp3' || extension === 'wav' || extension === 'ogg') {
    return 'audio'
  }
  return 'file'
}

// fileをstorageにまで上げる処理
const fileUpload = async (files: File[]): Promise<{ [fileId: string]: ChatFile }> => {
  if (!files) return {}; // ファイルがない場合でもオブジェクトを返します

  const uploadedChatFiles: { [fileId: string]: ChatFile } = {};

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (!checkFile(file)) {
      continue; // 無効なファイルをエラーなしでスキップ
    }

    const fileId = `${uuidv4()}`;
    const chatStorageRef = storageRef(storage, `chat/${roomId}/${fileId}`);

    const metadata = {
      contentType: file.type,
    };

    try {
      const snapshot = await uploadBytes(chatStorageRef, file, metadata);
      const url = await getDownloadURL(snapshot.ref);
      uploadedChatFiles[fileId] = {
        fileId,
        messageId: '', // アップロード時に適用
        fileName: file.name,
        fileUrl: url,
        fileType: mediaType(file),
        createdAt: serverTimestamp(),
      } as ChatFile;
    } catch (error) {
      console.error('ファイルのアップロード中にエラーが発生しました: ', error);
      // 回避するためにエラーを配列に収集するなど、異なるエラーハンドリングを検討してください
    }
  }

  return uploadedChatFiles;
};
// fileを削除する処理
  const deleteFile = (index: number): void => {
  // rawAttachmentFilesとattachmentFilesAsDataUrlから削除
  rawAttachmentFiles.value = rawAttachmentFiles.value.filter((_, i) => i !== index)
  attachmentFilesAsDataUrl.value = attachmentFilesAsDataUrl.value.filter((_, i) => i !== index)
}

</script>

<template>
  <div>
    <h1>chat detail</h1>
    <router-link to="/chat">&lg;戻る</router-link>
    <div class="chat">
      <div v-if="messages">
        <p v-if="isEnd">一番上まで読み込みました</p>
        <button v-else @click="readMoreMessages()">さらに読み込む</button>
        <div v-for="message in messages" :key="message.messageId" style="margin-top: 20px">
          <div v-if="usersPublicData && usersPublicData[message.senderUid]">

            <div v-if="message.undo" style="margin: 10px;" class="message-container">
              <div> &lang;&lang; このメッセージは削除されました &rang;&rang;</div>
            </div>
            <!--          1メッセージカード-->
            <div
                v-else
                :class="`message-container ${message.senderUid === userid ? 'my-message' : 'other-message'}`"
            >


              <div v-if="message.senderUid !== userid" class="message-icon">
                <img :src="usersPublicData[message.senderUid].iconURL" alt="user icon"/>
              </div>

              <!--            アイコン, 送信者名, 送信日時-->
<!--              <div class="message-header">-->
<!--                <div>{{ formatServerTimestamp(message.createdAt) }}</div>-->
<!--                &lt;!&ndash;                操作&ndash;&gt;-->
<!--                <div v-if="message.senderUid === userid">-->
<!--                  <button @click="undoMessage(message)">送信取り消し</button>-->

<!--                </div>-->
<!--              </div>-->

              <!--            本文と投稿者-->
              <div class="message-content">
                <p v-if="message.senderUid !== userid" class="message-user-name">{{ usersPublicData[message.senderUid].userName }}</p>
                <p class="message-text">
                  {{ message.message }}
                </p>
                <!--              添付ファイル-->
                <div v-if="message.attachedFiles" style="margin-top: 10px; border-top: 1px solid #252525;">
                  <div v-for="file in message.attachedFiles" :key="file.fileId">
                    <div v-if="file.fileType === 'image'">
                      <img :src="file.fileUrl" alt="attached file"/>
                      <p>{{ file.fileName }}</p>
                    </div>
                    <div v-else-if="file.fileType === 'video'">
                      <video :src="file.fileUrl" controls></video>
                      <p>{{ file.fileName }}</p>
                    </div>
                    <div v-else-if="file.fileType === 'audio'">
                      <audio :src="file.fileUrl" controls></audio>
                      <p>{{ file.fileName }}</p>
                    </div>
                    <a v-else :href="file.fileUrl" target="_blank">{{ file.fileName }}</a>
                  </div>
                </div>
              </div>

              <p class="date">{{ formatServerTimestamp(message.createdAt, "hh:mm") }}</p>

            </div>
            <!--          1メッセージカードここまで-->
          </div>
        </div>
      </div>
      <div>

        <!--        ファイル関連-->
        <div v-for="(url, index) in attachmentFilesAsDataUrl" :key="index">
          <!--          削除ボタン-->
          <button @click="deleteFile(index)">削除</button>
          <img v-if="mediaType(rawAttachmentFiles[index]) === 'image'" :src="url" alt="attached file"/>
        </div>
        <div>
          <label for="img-input">画像</label>
          <input type="file" accept="image/*" multiple @change="onFileChange($event as HTMLInputEvent | DragEvent)" id="img-input"/>
        </div>
        <div>
          <label for="file-input">ファイル</label>
          <input type="file" multiple @change="onFileChange($event as HTMLInputEvent | DragEvent)" id="file-input"/>
        </div>
        <textarea type="text" v-model="message" placeholder="メッセージを入力してください"/>
        <button @click="sendMessageCallback()">送信</button>
      </div>
    </div>
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
  font-size: .85em;
}

.date {
  font-size: .8em;
  margin: auto 0 4px;
}

.message-content {
}

.message-text {
  padding: 10px;
  border-radius: 20px;
}

.my-message .message-text {
  background-color: var(--sub-color);

}

.other-message .message-text  {
  background-color: var(--background-color);
}
</style>