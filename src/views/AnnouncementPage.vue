<script setup lang="ts">
import {computed, getCurrentInstance, ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import {useRoute} from "vue-router";
import type {Announcement, MavonEditorToolbars} from "@/types/chatpage/announcement";
import {formatServerTimestamp} from "../utils/database";
import {getCurrentRole} from "@/utils/auth";
import {getAuth} from "firebase/auth";
import type {Role} from "@/types/auth";
import {deleteAnnouncement, updateAnnouncement} from "@/utils/chat/announcements";
import router from "@/router";

const route = useRoute()
// 実際に表示するお知らせ内容。編集する場合はこちらが変更される
const title = ref('');
const content = ref('');
// 編集差分の検知などで使うバックアップお知らせ
const originalAnnouncement = ref<Announcement>();

const role = ref<Role>('')
getCurrentRole(getAuth()).then((value) => {
  role.value = value
})

// URLの末尾からこのページのannounceIdを取得して保管
const announceId = route.params.announceId

// このページで表示する記事
const announcementRef = fireRef(getDatabase(), 'testAnnouncements/announcements/' + announceId)

// お知らせを非同期で取得
onValue(announcementRef, (snapshot) => {
  originalAnnouncement.value = snapshot.val()
  title.value = snapshot.val().title
  content.value = snapshot.val().content
})

// 削除ボタンを押したときの関数
const deleteAnnounce = () => {
  if (!window.confirm('このお知らせを削除します。よろしいですか?')) return;
  deleteAnnouncement(announcementRef);
  router.push('/announcements')
}

// 編集モードかどうかを保管する変数
const editMode = ref<boolean>(false);

// mdエディターのツールバーの表示を制御する関数
const toolbarsPropertiesForVisibility = (visible: boolean) => {
  const keys = Object.keys({} as MavonEditorToolbars);
  return keys.reduce((acc, key) => {
    (acc as any)[key] = visible;
    return acc;
  }, {} as MavonEditorToolbars);
}

// 保存ボタンを押したときの関数
const saveAnnounce = () => {
  updateAnnouncement(announcementRef, {title: title.value, content: content.value});
  if (originalAnnouncement.value) {
    originalAnnouncement.value.title = title.value;
    originalAnnouncement.value.content = content.value;
  }
  isEdited.value =  checkIsEdited()
}

// 編集を終了する関数
const finishEdit = () => {
  if (isEdited.value) { // もし最後の保存時からなにか変更があれば
    if (window.confirm('編集内容を破棄しますか？')) { // 確認したうえで
      title.value = originalAnnouncement.value?.title || ''; // もとに戻す
      content.value = originalAnnouncement.value?.content || '';
      editMode.value = false; // 編集終了

      console.log(getCurrentInstance())
      getCurrentInstance()?.proxy?.$forceUpdate(); // コンポーネント再描画
    }
  } else { // 変更がないならそのまま終了
    editMode.value = false;
  }
}

// 保存していない変更があったかどうかを保管する変数
const isEdited = ref(false);

// お知らせを編集したかどうか検知する関数
const checkIsEdited = (mdEditorsContent: string | null = null) => {
  let result = false;
  result = title.value !== originalAnnouncement.value?.title // まずtitleが変更されているかどうか

  if (mdEditorsContent === null) { // もし変更されたのがtitleだけなら
    result = result || content.value !== originalAnnouncement.value?.content // 加えてannouncementのほうからcontentに変更があったか見る
  }
  else { // 引数にcontentが渡されている場合はそれで見る (再描画タイミングが違うため)
    result = result || mdEditorsContent !== originalAnnouncement.value?.content
  }
  return result
}

// titleやエディタ内で変更があったときのコールバック関数
const onChange = (mdEditorsContent: string | null = null) => {
  isEdited.value = checkIsEdited(mdEditorsContent)
  console.log(isEdited.value)
}

</script>
<template>
  <div>
    <div v-if="originalAnnouncement" style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
      <h1 v-if="!editMode">{{ title }}</h1>
      <h1 v-else><input @change="onChange()" v-model="title" @keydown="onChange()" @keyup="onChange()" :readonly="!editMode"></h1>
      <mavon-editor
          v-model="content"
          language="ja"
          :subfield=editMode
          defaultOpen="preview"
          placeholder="ここにテキストを入力..."
          :toolbars="toolbarsPropertiesForVisibility(editMode)"
          @change="(content: string) => {onChange(content);}"
      />
      <p>
        <span>投稿: {{ formatServerTimestamp(originalAnnouncement.createdAt) }}</span>
        <span v-if="originalAnnouncement.updatedAt"> (最終更新: {{ formatServerTimestamp(originalAnnouncement.updatedAt) }})</span>
      </p>
    </div>

  </div>

  <div v-if="role == '管理者'">
    <button v-if="!editMode" @click="editMode = !editMode">編集</button>
    <button v-if="editMode" :disabled="!isEdited" @click="saveAnnounce">保存して公開</button>
    <button v-if="editMode" @click="finishEdit">終了</button>
    <button @click="deleteAnnounce">削除</button>
  </div>

</template>