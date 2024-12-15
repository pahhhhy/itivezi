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
import {collectRoomName} from "../utils/chat/chat";
import {useChatRoomStore} from "@/stores/chatRoom";

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

const {user} = defineProps<{
  user: User
}>()
const userid = ref<string>(user.uid)

// piniaのuseUserStoreから登場ユーザーをすべて取得
const {getUserPublicData} = useUserDataStore();

const {currentRoom} = useChatRoomStore()
const roomId = currentRoom?.roomId || '';

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
  if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'svg' || extension === 'webp' || extension === 'JPG' || extension === 'JPEG' || extension === 'PNG' || extension === 'GIF' || extension === 'SVG' || extension === 'WEBP') {
    return 'image'
  }
  if (extension === 'mp4' || extension === 'webm' || extension === 'MP4' || extension === 'WEBM') {
    return 'video'
  }
  if (extension === 'mp3' || extension === 'wav' || extension === 'ogg' || extension === 'MP3' || extension === 'WAV' || extension === 'OGG') {
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
<!--    ルーム名-->
<!--    <h1>{{collectRoomName(room, )}}</h1>-->
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
                <p class="message-text" v-if="message.message || !message.attachedFiles" > <!-- 本文が空白でファイルが付いているのなら、本文を表示しない -->
                  {{ message.message }}
                </p>
                <!--              添付ファイル-->
                <div class="message-attached" v-if="message.attachedFiles">
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
                    <div v-else class="message-attached-file">
                      <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_505_827)">
                          <path d="M18.9097 2.44824H9.64697C8.71871 2.44824 7.82848 2.81699 7.1721 3.47337C6.51572 4.12975 6.14697 5.01998 6.14697 5.94824V26.9482C6.14697 27.8765 6.51572 28.7667 7.1721 29.4231C7.82848 30.0795 8.71871 30.4482 9.64697 30.4482H23.647C24.5752 30.4482 25.4655 30.0795 26.1218 29.4231C26.7782 28.7667 27.147 27.8765 27.147 26.9482V10.6855C27.1469 10.2214 26.9624 9.77635 26.6342 9.44824L20.147 2.96099C19.8189 2.63278 19.3738 2.44834 18.9097 2.44824ZM19.272 8.57324V5.07324L24.522 10.3232H21.022C20.5578 10.3232 20.1127 10.1389 19.7845 9.81068C19.4563 9.48249 19.272 9.03737 19.272 8.57324ZM10.522 18.1982C10.2899 18.1982 10.0673 18.1061 9.90325 17.942C9.73916 17.7779 9.64697 17.5553 9.64697 17.3232C9.64697 17.0912 9.73916 16.8686 9.90325 16.7045C10.0673 16.5404 10.2899 16.4482 10.522 16.4482H22.772C23.004 16.4482 23.2266 16.5404 23.3907 16.7045C23.5548 16.8686 23.647 17.0912 23.647 17.3232C23.647 17.5553 23.5548 17.7779 23.3907 17.942C23.2266 18.1061 23.004 18.1982 22.772 18.1982H10.522ZM9.64697 20.8232C9.64697 20.5912 9.73916 20.3686 9.90325 20.2045C10.0673 20.0404 10.2899 19.9482 10.522 19.9482H22.772C23.004 19.9482 23.2266 20.0404 23.3907 20.2045C23.5548 20.3686 23.647 20.5912 23.647 20.8232C23.647 21.0553 23.5548 21.2779 23.3907 21.442C23.2266 21.6061 23.004 21.6982 22.772 21.6982H10.522C10.2899 21.6982 10.0673 21.6061 9.90325 21.442C9.73916 21.2779 9.64697 21.0553 9.64697 20.8232ZM10.522 25.1982C10.2899 25.1982 10.0673 25.1061 9.90325 24.942C9.73916 24.7779 9.64697 24.5553 9.64697 24.3232C9.64697 24.0912 9.73916 23.8686 9.90325 23.7045C10.0673 23.5404 10.2899 23.4482 10.522 23.4482H17.522C17.754 23.4482 17.9766 23.5404 18.1407 23.7045C18.3048 23.8686 18.397 24.0912 18.397 24.3232C18.397 24.5553 18.3048 24.7779 18.1407 24.942C17.9766 25.1061 17.754 25.1982 17.522 25.1982H10.522Z" fill="black"/>
                        </g>
                      </svg>

                      <a :href="file.fileUrl" target="_blank">{{ file.fileName }}</a>
                    </div>
                  </div>
                </div>
              </div>

              <p class="date">
                {{
                // 今年送信されたメッセージで無いなら年も表示
                new Date().getFullYear() !== new Date(message.createdAt as number).getFullYear()
                ? formatServerTimestamp(message.createdAt as number, "yyyy")+"/": ""
                }}{{
                  // 今日送信されたメッセージかどうか
                  new Date().toDateString() === new Date(message.createdAt as number).toDateString()
                  ? formatServerTimestamp(message.createdAt as number, "hh:mm")
                  : formatServerTimestamp(message.createdAt as number, "MM/dd hh:mm")
                }}</p>

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

.my-message .message-text, .my-message .message-attached {
  border-radius: 20px;
  background-color: var(--sub-color);

}

.other-message .message-text, .other-message .message-attached  {
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
</style>