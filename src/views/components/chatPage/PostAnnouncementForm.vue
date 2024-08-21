<script setup lang="ts">
import {ref} from "vue";
import {getDatabase, serverTimestamp, ref as fireRef} from "firebase/database";
import {getAuth, type User} from "firebase/auth";
import {getCurrentRole, getCurrentUser} from "@/utils/auth";
import {postAnnouncement} from "@/utils/chat/announcements";

// 投稿者uid添付や投稿権限確認に使う変数
let user: User | null = null
const role = ref<string>('')

// 後にフォームから入力する部分
const title = ref<string>('');
const content = ref<string>('');

// お知らせのリファレンス
const announcementsRef = fireRef(getDatabase(), 'testAnnouncements/announcements')

// ユーザーを非同期で取得
getCurrentUser(getAuth()).then((newUser) => {
  if (newUser) user = newUser;
})
// ロールを非同期で取得
getCurrentRole(getAuth()).then((newRole) => {
  if (newRole) role.value = newRole;
});

// お知らせを投稿する処理
function post() {
  const pushData = {
    title: title.value,
    content: content.value,
    createdAt: serverTimestamp(),
    userID: user?.uid ?? '',
    categoryID: '',
  }

  postAnnouncement(announcementsRef, pushData)
  content.value = ''
}

</script>
<template>
  <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
    <h5>お知らせを送信する(仮)</h5>

    <label for="title">タイトル</label>
    <input id="title" type="text" v-model="title"/>

    <label for="content">内容</label>
    <input id="content" type="text" v-model="content"/>

    <button @click="post">送信</button>
  </div>
</template>