<script setup lang="ts">
import {ref} from "vue";
import {getDatabase, ref as fireRef, serverTimestamp} from "firebase/database";
import {useAuthData} from "@/utils/auth";
import {postAnnouncement} from "@/utils/announcement/announcements";
import {useAnnouncementFiles} from "@/utils/announcement/useAnnouncementFilesHook";


const {files, content, imgAdd, deleteImgFromStorage, splitFiles} = useAnnouncementFiles()

// 投稿者uid添付や投稿権限確認に使う変数
const {user, role} = useAuthData();

// 後にフォームから入力する部分
const title = ref<string>('');

// お知らせのリファレンス
const announcementsRef = fireRef(getDatabase(), 'testAnnouncements/announcements')


// お知らせを投稿する処理
function post() {
  const pushData = {
    title: title.value,
    content: content.value,
    createdAt: serverTimestamp(),
    userID: user.value?.uid ?? '',
    categoryID: '',
    comments: [],
  }

  const {deleteFiles} = splitFiles(files.value, content.value)
  deleteImgFromStorage(deleteFiles)

  postAnnouncement(announcementsRef, pushData)
  content.value = ''
}

</script>
<template>
  <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
    <h5>お知らせを送信する(仮)</h5>

    <label for="title">タイトル</label>
    <input id="title" type="text" required v-model="title"/>

    <mavon-editor language="ja" placeholder="ここにテキストを入力..." v-model="content" @imgAdd="imgAdd"/>

    <button @click="post">送信</button>
  </div>
</template>

<!-- .markdown-bodyはmavon-editor内のクラス -->
<style scoped>
.markdown-body {
  z-index: 0;
}
</style>