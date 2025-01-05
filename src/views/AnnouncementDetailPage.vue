<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {getDatabase, onValue, ref as fireRef} from 'firebase/database'
import type {Announcement, MavonEditorToolbars} from '@/types/announcement/announcement'
import {formatServerTimestamp} from '@/utils/database'
import {useAuthData} from '@/utils/auth'
import {changeAnnouncementCategory, deleteAnnouncement, updateAnnouncement} from '@/utils/announcement/announcements'
import router from '@/router'
import {useAnnouncementFiles} from '@/utils/announcement/useAnnouncementFilesHook'
import {storageURLPattern} from '@/types/files'
import type {AnnouncementCommentType, AnnouncementCommentWithViewData} from '@/types/announcement/announcementComments'
import AnnouncementCommentWrapper from '@/views/components/announcementPage/AnnouncementCommentWrapper.vue'
import {useUserDataStore} from '@/stores/userPublicData'
import type {UserPublicData} from '@/types/common/userPublicData'
import SimpleTextButton from "@/views/components/common/SimpleTextButton.vue";
import SlideMenu from "@/views/components/common/SlideMenu.vue";
import PostAnnouncementForm from "@/views/components/announcementPage/PostAnnouncementForm.vue";
import {useAnnouncementsStore} from "@/stores/announcements";


// 編集差分の検知などで使うバックアップ投稿
const originalAnnouncement = ref<Announcement>()
// ユーザーアイコンつきコメントを保管する変数
const commentsWithViewData = ref<AnnouncementCommentWithViewData[] | null>(null)
// 画像やファイルを扱うHooks
const {files, content, imgAdd, deleteImgFromStorage, splitFiles} = useAnnouncementFiles()
const title = ref<string>('');
const categoryId = ref<string>('');
// 編集モードかどうかを保管する変数
const editMode = ref<boolean>(false)
// 保存していない変更があったかどうかを保管する変数
const isEdited = ref(false)
// ログイン中のユーザー情報
const {user, role} = useAuthData()
// ユーザー情報を取得する関数
const {getUserPublicData} = useUserDataStore()
// 投稿者のpublicData
const authorPublicData = ref<null | UserPublicData>(null)

interface Props {
  announceId: string,
}

const {announceId} = defineProps<Props>()

const announcementsStore = useAnnouncementsStore();

// このページで表示する投稿のリファレンス
const db = getDatabase();
const announcementRef = fireRef(db, 'testAnnouncements/announcements/' + announceId)
const announcementRootRef = fireRef(db, 'testAnnouncements')

onMounted(async () => {
  // storeにキャッシュされていた場合は最初にそれを表示して高速化
  const announcement = announcementsStore.announcements.find((announce) => announce.announceId === announceId)
  if (announcement) {
    originalAnnouncement.value = announcement
    title.value = announcement.title
    content.value = announcement.content
    categoryId.value = announcement.categoryId
    authorPublicData.value = await getUserPublicData(announcement.userId)
  }

  // キャッシュの有無に関わらずリスナを設置してコメント含む更新を検知
  onValue(announcementRef, async (snapshot) => { // 投稿を非同期で取得
    originalAnnouncement.value = snapshot.val()
    if (!snapshot.exists()) { // 既に削除されていた場合
      announcementsStore.deleteAnnouncement(announceId)
      return
    }
    title.value = snapshot.val().title
    content.value = snapshot.val().content
    categoryId.value = snapshot.val().categoryId

    // 投稿ページへの直リンクでない限りキャッシュを利用できる
    authorPublicData.value = await getUserPublicData(snapshot.val().userId)

    const comments = snapshot.val().comments
    if (!comments) {
      commentsWithViewData.value = null
      return
    }

    function sortComments(comments: AnnouncementCommentType[]): AnnouncementCommentType[] {
      function compareLastUpdated(a: AnnouncementCommentType, b: AnnouncementCommentType) {
          let aUpdateAt = 0;
          let bUpdateAt = 0;
          if (typeof a.updatedAt === 'number') {
            aUpdateAt = a.updatedAt
          } else if (typeof a.createdAt === 'number') {
            aUpdateAt = a.createdAt
          }
          if (typeof b.updatedAt === 'number') {
            bUpdateAt = b.updatedAt
          } else if (typeof b.createdAt === 'number') {
            bUpdateAt = b.createdAt
          }
          return aUpdateAt - bUpdateAt
      }

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
      parentComments.sort(compareLastUpdated)

      // ソート済みの配列に結果を格納
      const sortedComments: AnnouncementCommentType[] = []

      parentComments.forEach((parent) => {
        sortedComments.push(parent)
        if (childComments[parent.commentId]) {
          childComments[parent.commentId].sort(compareLastUpdated)
          sortedComments.push(...childComments[parent.commentId])
        }
      })

      return sortedComments
    }

    const commentsArray = sortComments(
        Object.keys(comments).map((key) => {
          return {...comments[key], commentId: key}
        })
    )

    const commentsInfoAdded = commentsArray.map(async (comment) => {
      return await addUserInfoToComment(comment)
    })
    Promise.all(commentsInfoAdded).then((commentsInfoAdded: AnnouncementCommentWithViewData[]) => {
      commentsWithViewData.value = commentsInfoAdded
    })

    announcementsStore.updateAnnouncement(snapshot.val()) // storeを更新

  })
})

// コメントを渡すと送信者のアイコンと名前を追加して返す関数
const addUserInfoToComment = async (
    comment: AnnouncementCommentType
): Promise<AnnouncementCommentWithViewData> => {
  const userPublicData = await getUserPublicData(comment.userId)

  return {
    userIconURL: userPublicData?.iconURL ?? '', // もしデフォルトのアイコンを設定するのならここ
    userName: userPublicData?.userName ?? '',
    ...comment
  }
}

// -----表示関連機能ここまで-----

// -----編集関連機能-----
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
    files.value.push({id, url})
  }
}

// 編集モードを有効にするときに発動する関数
const allowEditMode = () => {
  updateFilesFromContent()
  editMode.value = true
}

// 削除ボタンを押したときの関数
const deleteAnnounce = async () => {
  if (!window.confirm('この投稿を削除します。よろしいですか?')) return

  updateFilesFromContent()
  deleteImgFromStorage(files.value)
  await deleteAnnouncement(announcementRootRef, announcementRef, announceId, categoryId.value);
  await router.push('/announcements')
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
const saveAnnounce = async () => {
  if (!window.confirm('編集内容を適用します。よろしいですか?')) return
  // 編集したかの検知は外部で行っている
  if (originalAnnouncement.value) {
    originalAnnouncement.value.title = title.value
    originalAnnouncement.value.content = content.value
    console.log(originalAnnouncement.value.categoryId)
    console.log(categoryId.value)
    if (originalAnnouncement.value.categoryId !== categoryId.value) { // カテゴリが変更された場合はannouncementCountも変更しなければならない
      await changeAnnouncementCategory(announcementRootRef, originalAnnouncement.value.announceId, originalAnnouncement.value.categoryId, categoryId.value, originalAnnouncement.value.createdAt);
      originalAnnouncement.value.categoryId = categoryId.value
    }
  }
  await updateAnnouncement(announcementRef, {title: title.value, content: content.value, categoryId: categoryId.value})
  isEdited.value = checkIsEdited()

  updateFilesFromContent()
  const {deleteFiles} = splitFiles(files.value, content.value)
  deleteImgFromStorage(deleteFiles)

  announcementsStore.updateAnnouncement(originalAnnouncement.value!)
  editMode.value = false
  alert('投稿を保存しました')
}

const resetContents = () => {
  if (isEdited.value && window.confirm('編集内容を破棄しますか？')) {
    title.value = originalAnnouncement.value?.title || '' // もとに戻す
    content.value = originalAnnouncement.value?.content || ''
    categoryId.value = originalAnnouncement.value?.categoryId || ''
  }
}

// 投稿を編集したかどうか検知する関数
const checkIsEdited = () => {
  let result: boolean
  result = title.value !== originalAnnouncement.value?.title // titleが変更されているかどうか
  result = result || content.value !== originalAnnouncement.value?.content // contentが変更されているかどうか
  result = result || categoryId.value !== originalAnnouncement.value?.categoryId // categoryIdが変更されているかどうか
  return result
}

watch([title, content, categoryId], () => {
  isEdited.value = checkIsEdited()
})

// -----編集関連機能ここまで-----
const postAnnouncementFormRef = ref<null | InstanceType<typeof PostAnnouncementForm>>(null);

</script>
<template>
  <SlideMenu title="投稿の編集" v-if="editMode" @close="editMode = false">
    <template #header-button>
      <SimpleTextButton
          bold fontSize="1em"
          @click="deleteAnnounce"
      >
        削除
      </SimpleTextButton>
      <SimpleTextButton
          bold fontSize="1em"
          :disabled="!isEdited || !postAnnouncementFormRef?.isValid"
          @click="resetContents"
      >
        リセット
      </SimpleTextButton>
      <SimpleTextButton
          bold fontSize="1.25em"
          :disabled="!isEdited || !postAnnouncementFormRef?.isValid"
          @click="saveAnnounce"
      >
        適用
      </SimpleTextButton>
    </template>
    <template #default>
      <PostAnnouncementForm
          :editMode="true"
          v-model:modelValueTitle="title"
          v-model:modelValueContent="content"
          v-model:modelValueCategoryId="categoryId"
          ref="postAnnouncementFormRef"
      />
    </template>
  </SlideMenu>

  <div class="screen-wrapper">
    <div class="contents-wrapper" v-if="originalAnnouncement">
      <div class="scroll-wrapper">
        <div class="announcement-wrapper">
          <div class="announcement-title-wrapper">
            <router-link to="/announcements">
              <IconLeftArrow/>
            </router-link>
            <h1 class="announcement-title">{{ originalAnnouncement.title }}</h1>


              <button v-if="role == '管理者' && !editMode" @click="allowEditMode" class="edit-button">
                <IconEdit/>
              </button>
          </div>
          <div class="announcement-head">
            <img
                v-if="authorPublicData?.iconURL"
                :src="authorPublicData.iconURL"
                alt="掲示板投稿者アイコン"
            />
            <div class="announcement-head-text">
              <p class="announcement-author">{{ authorPublicData?.userName }}</p>
              <p class="announcement-date">
                <span>{{
                    formatServerTimestamp(originalAnnouncement.createdAt, 'yyyy/MM/dd hh:mm')
                  }}</span>
                <span v-if="originalAnnouncement.updatedAt">
                  (最終更新:
                  {{ formatServerTimestamp(originalAnnouncement.updatedAt, 'yyyy/MM/dd hh:mm') }})
                </span>
              </p>
            </div>


          </div>
          <mavon-editor
              :key="editMode"
              v-model="originalAnnouncement.content"
              class="announcement-content"
              language="ja"
              :subfield="false"
              defaultOpen="preview"
              :boxShadow="false"
              placeholder="ここにテキストを入力..."
              editor-background="white"
              preview-background="white"
              style="background: white"
              :editable="false"
              :toolbars-flag="false"
              :toolbars="toolbarsPropertiesForVisibility(false)"
          />

          <AnnouncementCommentWrapper
              v-if="user"
              :user="user"
              :commentsWithViewData="commentsWithViewData ?? []"
              :announcementRef="announcementRef"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>

button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

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

.announcement-title-wrapper {
  display: flex;
  flex-direction: row;
  margin: 1em 0;
  border-bottom: 1px solid var(--text-color);
  position: sticky;
  top: 0;
  background-color: white;
}

.announcement-title {
  font-size: 1.5em;
  font-weight: bold;
}

.announcement-wrapper {
  height: fit-content;
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.announcement-content {
  /* mavon-editorで使用中 */
  z-index: -1;
  padding-top: 1em;
}

.announcement-head {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
  gap: .8em;
  border-bottom: 1px solid lightgray;
  margin-bottom: 4px;
  padding: 0 .8em;
  height: fit-content;
}

.announcement-head > img {
  display: inline-block;
  width: 36px;
  aspect-ratio: 1;
  border-radius: 100%;
  flex-grow: 1;
}

.announcement-head-text {
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
  height: 3em;
  margin: 0;
  flex-grow: 0;
}

.edit-button {
  position: absolute;
  right: 0;
  width: 7.5%;
  aspect-ratio: 1;
}

p {
  margin: 0;
}

.announcement-author {
  font-weight: bold;
  font-size: .9em;
}

.announcement-date {
  font-size: 0.7em;
  color: gray;
}

.scroll-style {
  background-color: white !important;
}


</style>
