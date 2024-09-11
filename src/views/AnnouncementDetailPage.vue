<script setup lang="ts">
import {getCurrentInstance, ref} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import {useRoute} from "vue-router";
import type {Announcement, MavonEditorToolbars} from "@/types/announcement/announcement";
import {formatServerTimestamp} from "@/utils/database";
import {useAuthData} from "@/utils/auth";
import {deleteAnnouncement, updateAnnouncement} from "@/utils/announcement/announcements";
import router from "@/router";
import {useAnnouncementFiles} from "@/utils/announcement/announcementFilesHook";
import {storageURLPattern} from "@/types/files";
import {useAnnouncementCommentEditor} from "@/utils/announcement/announcementCommentEditorHook";

const route = useRoute()
// 実際に表示するお知らせ内容。編集する場合はこちらが変更される
const title = ref('');
// 編集差分の検知などで使うバックアップお知らせ
const originalAnnouncement = ref<Announcement>();
// 画像やファイルを扱うHooks
const {files, content, imgAdd, deleteImgFromStorage, splitFiles} = useAnnouncementFiles()
// 編集モードかどうかを保管する変数
const editMode = ref<boolean>(false);
// 保存していない変更があったかどうかを保管する変数
const isEdited = ref(false);
// ユーザー情報
const {user, role} = useAuthData()

// -----表示関連機能-----

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

// -----表示関連機能ここまで-----

// -----編集関連機能-----
// TODO: roleが管理者だった場合にのみ読み込むコンポーネントへの切り出し

const updateFilesFromContent = () => {
  // "![<id>](<URLPatternから始まるurl>)"のような形式の文字列を探す正規表現
  const regex = new RegExp(`!\\[(.*)]\\((${storageURLPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*)\\)`, 'g');
  // contentの中身から画像ファイルを検知してfilesに追加
  for (const match of content.value.matchAll(regex)) {
    const id = match[1];
    const url = match[2];
    files.value.push({id, url});
  }
}

// 編集モードを有効にするときに発動する関数
const allowEditMode = () => {
  updateFilesFromContent()
  editMode.value = true;
}

// 削除ボタンを押したときの関数
const deleteAnnounce = () => {
  if (!window.confirm('このお知らせを削除します。よろしいですか?')) return;

  updateFilesFromContent()
  deleteImgFromStorage(files.value)
  deleteAnnouncement(announcementRef);
  router.push('/announcements')
}


// mdエディターのツールバーの表示を制御する関数
const toolbarsPropertiesForVisibility = (visible: boolean) => {
  function createUniformObjectFromType<T extends MavonEditorToolbars>(value: any): { [K in keyof T]: any } {
    const result: { [K in keyof T]: any } = {} as { [K in keyof T]: any };
    return new Proxy(result, {
      get: () => value,
      ownKeys: () => Object.keys(result),
      getOwnPropertyDescriptor: () => ({
        enumerable: true,
        configurable: true,
      }),
    });
  }

  return createUniformObjectFromType<MavonEditorToolbars>(visible);
}

// 保存ボタンを押したときの関数
const saveAnnounce = () => {
  // 編集したかの検知は外部で行っている

  updateAnnouncement(announcementRef, {title: title.value, content: content.value});
  if (originalAnnouncement.value) {
    originalAnnouncement.value.title = title.value;
    originalAnnouncement.value.content = content.value;
  }
  isEdited.value = checkIsEdited()

  updateFilesFromContent()
  const {deleteFiles} = splitFiles(files.value, content.value)
  deleteImgFromStorage(deleteFiles)
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


// お知らせを編集したかどうか検知する関数
const checkIsEdited = (mdEditorsContent: string | null = null) => {
  let result = false;
  result = title.value !== originalAnnouncement.value?.title // まずtitleが変更されているかどうか

  if (mdEditorsContent === null) { // もし変更されたのがtitleだけなら
    result = result || content.value !== originalAnnouncement.value?.content // 加えてannouncementのほうからcontentに変更があったか見る
  } else { // 引数にcontentが渡されている場合はそれで見る (再描画タイミングが違うため)
    result = result || mdEditorsContent !== originalAnnouncement.value?.content
  }
  return result
}

// titleやエディタ内で変更があったときのコールバック関数
const onChange = (mdEditorsContent: string | null = null) => {
  isEdited.value = checkIsEdited(mdEditorsContent)
}

// -----編集関連機能ここまで-----

// -----コメント, コメント返信関連機能ここから-----
const commentHooks = useAnnouncementCommentEditor(announcementRef, user)
const commentEditorComponent = commentHooks.commentEditorComponent
const replyEditorComponent = commentHooks.replyEditorComponent

// -----コメント, コメント返信関連機能ここまで-----

</script>
<template>
  <div>
    <div v-if="originalAnnouncement">
      <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
        <h1 v-if="!editMode">{{ title }}</h1>
        <h1 v-else><input @change="onChange()" v-model="title" @keydown="onChange()" @keyup="onChange()"
                          :readonly="!editMode"></h1>
        <mavon-editor
            :key="editMode"
            v-model="content"
            language="ja"
            :subfield=editMode
            defaultOpen="preview"
            placeholder="ここにテキストを入力..."
            :toolbars="toolbarsPropertiesForVisibility(editMode)"
            @change="(changedContent: string) => {onChange(changedContent);}"
            @imgAdd="imgAdd"
        />
        <p>
          <span>投稿: {{ formatServerTimestamp(originalAnnouncement.createdAt) }}</span>
          <span v-if="originalAnnouncement.updatedAt"> (最終更新: {{
              formatServerTimestamp(originalAnnouncement.updatedAt)
            }})</span>
        </p>

        <div v-if="role == '管理者'">
          <button v-if="!editMode" @click="allowEditMode">編集</button>
          <button v-if="editMode" :disabled="!isEdited" @click="saveAnnounce">保存して公開</button>
          <button v-if="editMode" @click="finishEdit">終了</button>
          <button @click="deleteAnnounce">削除</button>
        </div>

      </div>


      <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
        <p>コメント</p>
        <div v-for="comment in originalAnnouncement.comments" :key="(comment.createdAt as number)"
             style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
          <p>{{ comment.content }}</p>
          <p>{{ comment.createdAt }}</p>
          <button v-if="comment.userId === user?.uid" @click="commentHooks.deleteComment(comment.commentId)">削除
          </button>

          <div v-for="reply in comment.replies" :key="(reply.createdAt as number)"
               style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
            <p>{{ reply.content }}</p>
            <p>{{ reply.createdAt }}</p>
          </div>
          <button v-if="comment.userId === user?.uid" @click="commentHooks.editComment()">編集</button>
          <button :disabled="!user?.uid" v-if="commentHooks.replyingCommentId.value === comment.commentId"
                  @click="commentHooks.setReplyingMessage(null)">返信をキャンセル
          </button>
          <button :disabled="!user?.uid" v-else @click="commentHooks.setReplyingMessage(comment.commentId)">返信
          </button>
          <div v-if="commentHooks.replyingCommentId.value === comment.commentId">
            <replyEditorComponent/>
            <button :disabled="!user?.uid" @click="commentHooks.addReply">送信</button>
          </div>
        </div>
        <commentEditorComponent/>
        <button :disabled="!user?.uid" @click="commentHooks.addComment">コメントを送信</button>
      </div>
    </div>
  </div>

</template>
