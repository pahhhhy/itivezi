<script setup lang="ts">
import {ref} from "vue";
import {getDatabase, ref as fireRef, serverTimestamp} from "firebase/database";
import {useAuthData} from "@/utils/auth";
import {postAnnouncement} from "@/utils/announcement/announcements";
import {useAnnouncementFiles} from "@/utils/announcement/useAnnouncementFilesHook";
import type {Category} from "@/types/announcement/categories";


interface Props {
  categories: Category[]
}

const {categories} = defineProps<Props>()


const {files, content, imgAdd, deleteImgFromStorage, splitFiles} = useAnnouncementFiles()

// 投稿者uid添付や投稿権限確認に使う変数
const {user, role} = useAuthData();

// 後にフォームから入力する部分
const title = ref<string>('');
const category = ref<string>('')

// お知らせのリファレンス
const announcementRootRef = fireRef(getDatabase(), 'testAnnouncements')


// お知らせを投稿する処理
async function post() {
    const pushData = {
        title: title.value,
        content: content.value,
        createdAt: serverTimestamp(),
        userId: user.value?.uid ?? '',
        categoryId: category.value,
        comments: [],
    }

    const {deleteFiles} = splitFiles(files.value, content.value)
    deleteImgFromStorage(deleteFiles)

    await postAnnouncement(announcementRootRef, pushData)
    content.value = ''
}

</script>
<template>
  <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
    <h5>お知らせを送信する(仮)</h5>
    <div>
      <label for="category">カテゴリ</label>
      <select v-model="category">
        <option v-for="category in categories" :key="category.categoryId" :value="category.categoryId">
          {{ category.categoryName }}
        </option>
      </select>
    </div>
    <div>
      <label for="title">タイトル</label>
      <input id="title" type="text" required v-model="title"/>
    </div>
      <!--    <announcement-editor v-model="content" @imgAdd="imgAdd"/>-->
    <mavon-editor language="ja" placeholder="ここにテキストを入力..." v-model="content" @imgAdd="imgAdd"/>

    <button :disabled="!title || !content || !category" @click="post">送信</button>
  </div>
</template>

<!-- .markdown-bodyはmavon-editor内のクラス -->
<style scoped>
.markdown-body {
  z-index: 0;
}
</style>