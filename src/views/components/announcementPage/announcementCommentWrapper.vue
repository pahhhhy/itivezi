<script lang="ts" setup>
import type {User} from 'firebase/auth'
import type {AnnouncementCommentWithViewData} from '@/types/announcement/announcementComments'
import {useAnnouncementCommentEditor} from '@/utils/announcement/useAnnouncementCommentEditorHook'
import type {DatabaseReference} from 'firebase/database'
import AnnouncementComment from '@/views/components/announcementPage/AnnouncementCommentCard.vue'
import {computed} from "vue";

interface Props {
  user: User
  commentsWithViewData: AnnouncementCommentWithViewData[]
  announcementRef: DatabaseReference // 親コンポーネントで表示する投稿
}

const props = defineProps<Props>()
const {user, announcementRef} = props

// -----コメント, コメント返信関連機能ここから-----
const commentHooks = useAnnouncementCommentEditor(announcementRef, user)
const commentInputField = commentHooks?.commentInputField

// -----コメント, コメント返信関連機能ここまで-----

const replyingUserName = computed(() => {
  return props.commentsWithViewData.find(
      (comment) => comment.commentId === commentHooks.replyingCommentId.value
  )?.userName;
});

const isShowAlert = computed(() => {
  return commentHooks.replyingCommentId.value && props.commentsWithViewData;
});
</script>
<template>
  <!--    ここからコメント-->
  <div v-if="props.commentsWithViewData.length > 0 && user" class="comment-wrapper">
    <AnnouncementComment
        v-for="comment in props.commentsWithViewData"
        :key="comment.createdAt as number"
        :comment="comment"
        :commentHooks="commentHooks"
        :user="user"
    />
  </div>
  <div v-else class="comment-wrapper">
    <p style="margin-top: 1em;text-align: center; color: gray;">コメントはありません</p>
  </div>

  <div v-if="commentHooks" class="comment-input-field">
    <div v-if="isShowAlert" class="comment-input-field-alert">
      <p>{{ replyingUserName }}に返信中</p>
      <button @click="commentHooks.setReplyingMessage(null)">キャンセル</button>
    </div>
    <div v-if="commentHooks.editingCommentId.value" class="comment-input-field-alert">
      <p>編集中</p>
      <button @click="commentHooks.setEditingMessage(null)">キャンセル</button>
    </div>

    <commentInputField/>
  </div>
</template>
<style scoped>
.comment-wrapper {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  border-top: 1px solid gray;
  flex-grow: 1;

}

.comment-input-field {
  display: flex;
  flex-direction: column;
  width: inherit;
  max-width: inherit;
  height: fit-content;

  position: sticky;
  bottom: 0;

  padding:4px 0 0;
  background: white;
  border-top: 1px solid gray;

  .input-area {
    padding-top:0;
  }
}

.comment-input-field-alert {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 1em;
  background: white;

  p {
    margin: 0;
  }
}

.comment-input-field-alert > button {
  cursor: pointer;
  color: #0000ee;
  border: none;
  background-color: transparent;
}
</style>