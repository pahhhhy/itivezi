<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue'
import { getDatabase, onValue, ref as fireRef } from 'firebase/database'
import { useRoute } from 'vue-router'
import type { Announcement, MavonEditorToolbars } from '@/types/announcement/announcement'
import { formatServerTimestamp } from '@/utils/database'
import { useAuthData } from '@/utils/auth'
import { deleteAnnouncement, updateAnnouncement } from '@/utils/announcement/announcements'
import router from '@/router'
import { useAnnouncementFiles } from '@/utils/announcement/useAnnouncementFilesHook'
import { storageURLPattern } from '@/types/files'
import { getUserIconURL, getUserName } from '@/utils/common/userData'
import KebabMenu from '@/views/components/common/kebabMenu.vue'
import type {
  AnnouncementCommentType,
  AnnouncementCommentWithViewData
} from '@/types/announcement/announcementComments'
import type { Category } from '@/types/announcement/categories'
import AnnouncementCommentWrapper from '@/views/components/announcementPage/announcementCommentWrapper.vue'

const route = useRoute()
// 実際に表示するお知らせ内容。編集する場合はこちらが変更される
const title = ref('')
// 編集差分の検知などで使うバックアップお知らせ
const originalAnnouncement = ref<Announcement>()
// ユーザーアイコンつきコメントを保管する変数
const commentsWithViewData = ref<AnnouncementCommentWithViewData[] | null>(null)
// 画像やファイルを扱うHooks
const { files, content, imgAdd, deleteImgFromStorage, splitFiles } = useAnnouncementFiles()
// 編集モードかどうかを保管する変数
const editMode = ref<boolean>(false)
// 保存していない変更があったかどうかを保管する変数
const isEdited = ref(false)
// ログイン中のユーザー情報
const { user, role } = useAuthData()
// 投稿者のアイコンURL
const authorUserIconRef = ref<null | string>(null)
// 投稿者のname
const authorName = ref<null | string>(null)

// categoriesをpropsで受け取る
const { categories } = defineProps<{
  categories: Category[]
}>()

// -----表示関連機能-----

// URLの末尾からこのページのannounceIdを取得して保管
const announceId = route.params.announceId

// このページで表示する記事
const announcementRef = fireRef(getDatabase(), 'testAnnouncements/announcements/' + announceId)

onMounted(() => {
  // お知らせを非同期で取得
  onValue(announcementRef, async (snapshot) => {
    console.log('onvalue')
    console.log(snapshot.val())
    console.log('categories', categories)
    originalAnnouncement.value = snapshot.val()
    title.value = snapshot.val().title
    content.value = snapshot.val().content
    // TODO:
    getUserIconURL(snapshot.val().userId).then((url) => {
      // 投稿者のアイコンを取得
      authorUserIconRef.value = url
    })
    getUserName(snapshot.val().userId).then((name) => {
      // 投稿者の名前を取得
      authorName.value = name
    })

    const comments = snapshot.val().comments
    if (!comments) {
      commentsWithViewData.value = null
      return
    }

    function sortComments(comments: AnnouncementCommentType[]): AnnouncementCommentType[] {
      // 親コメントと子コメントを分離
      const parentComments: AnnouncementCommentType[] = []
      const childComments: Record<string, AnnouncementCommentType[]> = {}

      comments.forEach((comment) => {
        if (!comment.replyTo) {
          parentComments.push(comment)
        } else {
          if (!childComments[comment.replyTo]) {
            childComments[comment.replyTo] = []
          }
          childComments[comment.replyTo].push(comment)
        }
      })

      // 親コメントを日時順にソート
      parentComments.sort(
        (a, b) =>
          (typeof a.updatedAt === 'number'
            ? a.updatedAt
            : typeof a.createdAt === 'number'
              ? a.createdAt
              : 0) -
          (typeof b.updatedAt === 'number'
            ? b.updatedAt
            : typeof b.createdAt === 'number'
              ? b.createdAt
              : 0)
      )

      // ソート済みの配列に結果を格納
      const sortedComments: AnnouncementCommentType[] = []

      parentComments.forEach((parent) => {
        sortedComments.push(parent)
        if (childComments[parent.commentId]) {
          childComments[parent.commentId].sort(
            (a, b) =>
              (typeof a.updatedAt === 'number'
                ? a.updatedAt
                : typeof a.createdAt === 'number'
                  ? a.createdAt
                  : 0) -
              (typeof b.updatedAt === 'number'
                ? b.updatedAt
                : typeof b.createdAt === 'number'
                  ? b.createdAt
                  : 0)
          )
          sortedComments.push(...childComments[parent.commentId])
        }
      })

      return sortedComments
    }

    const commentsArray = sortComments(
      Object.keys(comments).map((key) => {
        return { ...comments[key], commentId: key }
      })
    )

    const commentsInfoAdded = commentsArray.map(async (comment) => {
      return await addUserInfoToComment(comment)
    })
    Promise.all(commentsInfoAdded).then((commentsInfoAdded: AnnouncementCommentWithViewData[]) => {
      commentsWithViewData.value = commentsInfoAdded
    })
  })
})

// コメントを渡すと送信者のアイコンと名前を追加して返す関数
const addUserInfoToComment = async (
  comment: AnnouncementCommentType
): Promise<AnnouncementCommentWithViewData> => {
  console.log('addUserInfoToComment', comment)
  // コメント送信者のアイコンを取得
  const url = await getUserIconURL(comment.userId)
  // コメント送信者の名前を取得
  const name = await getUserName(comment.userId)

  return {
    userIconURL: url ?? '', // もしデフォルトのアイコンを設定するのならここ
    userName: name ?? '',
    ...comment
  }
}

// -----表示関連機能ここまで-----

// -----編集関連機能-----
// TODO: roleが管理者だった場合にのみ読み込むコンポーネントへの切り出し

const updateFilesFromContent = () => {
  // "![<id>](<URLPatternから始まるurl>)"のような形式の文字列を探す正規表現
  const regex = new RegExp(
    `!\\[(.*)]\\((${storageURLPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*)\\)`,
    'g'
  )
  // contentの中身から画像ファイルを検知してfilesに追加
  for (const match of content.value.matchAll(regex)) {
    const id = match[1]
    const url = match[2]
    files.value.push({ id, url })
  }
}

// 編集モードを有効にするときに発動する関数
const allowEditMode = () => {
  updateFilesFromContent()
  editMode.value = true
}

// 削除ボタンを押したときの関数
const deleteAnnounce = () => {
  if (!window.confirm('このお知らせを削除します。よろしいですか?')) return

  updateFilesFromContent()
  deleteImgFromStorage(files.value)
  deleteAnnouncement(announcementRef)
  router.push('/announcements')
}

// mdエディターのツールバーの表示を制御する関数
const toolbarsPropertiesForVisibility = (visible: boolean) => {
  function createUniformObjectFromType<T extends MavonEditorToolbars>(
    value: any
  ): { [K in keyof T]: any } {
    const result: { [K in keyof T]: any } = {} as { [K in keyof T]: any }
    return new Proxy(result, {
      get: () => value,
      ownKeys: () => Object.keys(result),
      getOwnPropertyDescriptor: () => ({
        enumerable: true,
        configurable: true
      })
    })
  }

  return createUniformObjectFromType<MavonEditorToolbars>(visible)
}

// 保存ボタンを押したときの関数
const saveAnnounce = () => {
  // 編集したかの検知は外部で行っている

  updateAnnouncement(announcementRef, { title: title.value, content: content.value })
  if (originalAnnouncement.value) {
    originalAnnouncement.value.title = title.value
    originalAnnouncement.value.content = content.value
  }
  isEdited.value = checkIsEdited()

  updateFilesFromContent()
  const { deleteFiles } = splitFiles(files.value, content.value)
  deleteImgFromStorage(deleteFiles)
}

// 編集を終了する関数
const finishEdit = () => {
  if (isEdited.value) {
    // もし最後の保存時からなにか変更があれば
    if (window.confirm('編集内容を破棄しますか？')) {
      // 確認したうえで
      title.value = originalAnnouncement.value?.title || '' // もとに戻す
      content.value = originalAnnouncement.value?.content || ''
      editMode.value = false // 編集終了

      console.log(getCurrentInstance())
      getCurrentInstance()?.proxy?.$forceUpdate() // コンポーネント再描画
    }
  } else {
    // 変更がないならそのまま終了
    editMode.value = false
  }
}

// お知らせを編集したかどうか検知する関数
const checkIsEdited = (mdEditorsContent: string | null = null) => {
  let result: boolean
  result = title.value !== originalAnnouncement.value?.title // まずtitleが変更されているかどうか

  if (mdEditorsContent === null) {
    // もし変更されたのがtitleだけなら
    result = result || content.value !== originalAnnouncement.value?.content // 加えてannouncementのほうからcontentに変更があったか見る
  } else {
    // 引数にcontentが渡されている場合はそれで見る (再描画タイミングが違うため)
    result = result || mdEditorsContent !== originalAnnouncement.value?.content
  }
  return result
}

// titleやエディタ内で変更があったときのコールバック関数
const onChange = (mdEditorsContent: string | null = null) => {
  isEdited.value = checkIsEdited(mdEditorsContent)
}

// -----編集関連機能ここまで-----

// const authorUserIconRef = ref<null | string>(getUserIconURL(originalAnnouncement.value?.userId));
// console.log(authorUserIconRef)
</script>
<template>
  <div class="screen-wrapper">
    <div class="contents-wrapper" v-if="originalAnnouncement">
      <div class="scroll-wrapper">
        <div class="announcement-wrapper">
          <p class="announcement-title">{{ title }}</p>
          <div class="announcement-head">
            <img v-if="authorUserIconRef" :src="authorUserIconRef" alt="掲示板投稿者アイコン" />
            <div class="announcement-head-text">
              <p class="announcement-author">{{ authorName }}</p>
              <p class="announcement-date">
                <span>{{ formatServerTimestamp(originalAnnouncement.createdAt) }}</span>
                <span v-if="originalAnnouncement.updatedAt">
                  (最終更新: {{ formatServerTimestamp(originalAnnouncement.updatedAt) }})</span
                >
              </p>
            </div>
            <div class="kebab">
              <div v-if="role == '管理者'">
                <kebabMenu>
                  <!--                  TODO: 次やるのはこれ作るでもいいし, 喫緊なのはコメントの体裁を整えてコメントの編集, ユーザーアイコンと投稿者表示,-->
                  <!--                  すること (画像は不要) ← これやる-->
                  <!--                  TODO: コメントのmd対応は本質ではないのでwysiwygは記事投稿のところにのみ使おう-->
                  <!--                  TODO: その後に投稿カテゴリー追加もやる ← categoryIdはもうあるのでこれを追加する処理,-->
                  <!--                  作成編集削除一覧管理する処理(AnnouncementsList内で良し)を作る-->
                  <button v-if="!editMode" @click="allowEditMode">編集</button>
                  <button v-if="editMode" :disabled="!isEdited" @click="saveAnnounce">
                    保存して公開
                  </button>
                  <button v-if="editMode" @click="finishEdit">終了</button>
                  <button @click="deleteAnnounce">削除</button>
                </kebabMenu>
              </div>
            </div>
          </div>
          <p v-if="editMode">
            <input
              @change="onChange()"
              v-model="title"
              @keydown="onChange()"
              @keyup="onChange()"
              :readonly="!editMode"
            />
          </p>
          <mavon-editor
            :key="editMode"
            v-model="content"
            class="announcement-content"
            language="ja"
            :subfield="editMode"
            defaultOpen="preview"
            :boxShadow="false"
            placeholder="ここにテキストを入力..."
            :toolbars="toolbarsPropertiesForVisibility(editMode)"
            @change="
              (changedContent: string) => {
                onChange(changedContent)
              }
            "
            @imgAdd="imgAdd"
          />

          <AnnouncementCommentWrapper v-if="user" :user="user" :commentsWithViewData="commentsWithViewData ?? []" :announcementRef="announcementRef" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.screen-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: calc(100vh - 80px);
  width: 100%;
  transition: all 0.5s linear;
}

.contents-wrapper {
  padding: 0.25em;
  position: relative;
  height: 100%;
  width: auto;
  max-width: 100vw;
  aspect-ratio: 9 / 16;

  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

.scroll-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
}

.announcement-title {
  font-size: 1.5em;
  font-weight: bold;
}

.announcement-wrapper {
  height: fit-content;
}
.announcement-content {
  z-index: -100;
}

.announcement-head {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
  gap: 1rem;
  border-bottom: 1px solid black;
  padding-bottom: 1em;
  height: fit-content;
}

.announcement-head > img {
  display: inline-block;
  width: 10%;
  aspect-ratio: 1;
  border-radius: 100%;
  flex-grow: 1;
}

.announcement-head-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  width: 100%;
  height: 3em;
  margin: 0;
  flex-grow: 0;
}

.kebab {
  position: absolute;
  right: 0;
  width: 7.5%;
  aspect-ratio: 1;
}

.kebab button {
  width: fit-content;
  min-width: 100%;
  display: inline-block;
  white-space: nowrap;
}

p {
  margin: 0;
}

.announcement-author {
  font-size: 1.2em;
  font-weight: bold;
}

.announcement-date {
  font-size: 0.8em;
}

.scroll-style {
  background-color: white !important;
}

.comment-wrapper {
  margin-top: 2em;
}

.kebab {
  position: absolute;
  right: 0;
  width: 7.5%;
  aspect-ratio: 1;
}

.comment-input-field {
  display: flex;
  height: fit-content;
  width: 100%;
  flex-direction: column;
}

.comment-input-field-alert {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 1em;
}

.comment-input-field-alert > button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #0000ee;
}
</style>
