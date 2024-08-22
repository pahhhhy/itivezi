<script setup lang="ts">
import {computed, ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import {useRoute} from "vue-router";
import type {Announcement, MavonEditorToolbars} from "@/types/chatpage/announcement";
import {formatServerTimestamp} from "../utils/database";
import {getCurrentRole} from "@/utils/auth";
import {getAuth} from "firebase/auth";
import type {Role} from "@/types/auth";
import {deleteAnnouncement, updateAnnouncement} from "@/utils/chat/announcements";
import router from "@/router";
import {marked} from "marked";

const route = useRoute()
// 実際に表示するお知らせ。編集する場合はこちらが変更される
const announcement = ref<Announcement>();
// 編集差分の検知などで使うバックアップお知らせ
const originalAnnouncement = ref<Announcement>();

const role = ref<Role>('')
getCurrentRole(getAuth()).then((value) => {
  role.value = value
})

// このページのannounceId
const announceId = route.params.announceId
// このページで表示する記事
const announcementRef = fireRef(getDatabase(), 'testAnnouncements/announcements/' + announceId)
// お知らせを非同期で取得
onValue(announcementRef, (snapshot) => {
  announcement.value = snapshot.val()
  originalAnnouncement.value = snapshot.val()
})

const onClickDelete = () => {
  deleteAnnouncement(announcementRef);
  router.push('/announcements')
}

const editMode = ref<boolean>(false);
const toolbarsPropertiesForVisibility = (visible: boolean) => {
    const keys = Object.keys({} as MavonEditorToolbars);
    return keys.reduce((acc, key) => {
      (acc as any)[key] = visible;
      return acc;
    }, {} as MavonEditorToolbars);
}

const save = () => {
  if (announcement.value) {
    updateAnnouncement(announcementRef, announcement.value)
    originalAnnouncement.value = announcement.value
  }
}
const finishEdit = () => {
  if (isEdited.value) { // もし最後の保存時からなにか変更があれば
    if (window.confirm('編集内容を破棄しますか？')) { // 確認したうえで
      announcement.value = originalAnnouncement.value;
      editMode.value = false; // 編集終了
    }
  } else { // 変更がないならそのまま終了
    editMode.value = false;
  }
}

// お知らせを編集したかどうか検知する関数
const isEdited = computed(() => {
  return JSON.stringify(announcement.value) !== JSON.stringify(originalAnnouncement.value)
})


</script>
<template>
  <div>
    <div v-if="announcement" style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
      <h1 v-if="!editMode">{{ announcement.title }}</h1>
      <h1 v-else><input v-model="announcement.title" :readonly="!editMode" ></h1>
      <mavon-editor
          v-model="announcement.content"
          language="ja"
          :subfield=editMode
          defaultOpen="preview"
          :toolbars="toolbarsPropertiesForVisibility(editMode)"
      />
      <p>
        <span>投稿: {{ formatServerTimestamp(announcement.createdAt)}}</span>
        <span v-if="announcement.updatedAt">(最終更新: {{ formatServerTimestamp(announcement.updatedAt)}})</span>
      </p>
    </div>

  </div>

  <div v-if="role == '管理者'">
    <button v-if="!editMode" @click="editMode = !editMode">編集</button>
    <button v-if="editMode" @click="save">保存して公開</button>
    <button v-if="editMode" @click="finishEdit">終了</button>
    <button @click="onClickDelete">削除</button>
  </div>

</template>