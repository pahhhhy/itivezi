<script setup lang="ts">
import type { User } from 'firebase/auth'
import type { AnnouncementCommentWithViewData } from '@/types/announcement/announcementComments'
import { useAnnouncementCommentEditor } from '@/utils/announcement/useAnnouncementCommentEditorHook'
import type { DatabaseReference } from 'firebase/database'
import AnnouncementComment from '@/views/components/announcementPage/announcementCommentCard.vue'

interface Props {
  user: User
  commentsWithViewData: AnnouncementCommentWithViewData[]
  announcementRef: DatabaseReference // 親コンポーネントで表示する記事
}

const { user, commentsWithViewData, announcementRef } = defineProps<Props>()

// -----コメント, コメント返信関連機能ここから-----
const commentHooks = useAnnouncementCommentEditor(announcementRef, user)
const commentInputField = commentHooks?.commentInputField

// -----コメント, コメント返信関連機能ここまで-----
</script>
<template>
  <!--    ここからコメント-->
  <div class="comment-wrapper" v-if="commentsWithViewData && user">
    <AnnouncementComment
      v-for="comment in commentsWithViewData"
      :key="comment.createdAt as number"
      :user="user"
      :comment="comment"
      :commentHooks="commentHooks"
    />
  </div>

  <div class="comment-input-field" v-if="commentHooks">
    <div
      class="comment-input-field-alert"
      v-if="commentHooks.replyingCommentId.value && commentsWithViewData"
    >
      <p>
        返信先:
        {{
          commentsWithViewData.find(
            (comment) => comment.commentId === commentHooks!.replyingCommentId.value
          )?.userName
        }}
      </p>
      <button @click="commentHooks.setReplyingMessage(null)">キャンセル</button>
    </div>
    <div class="comment-input-field-alert" v-if="commentHooks.editingCommentId.value">
      <p>編集中</p>
      <button @click="commentHooks.setEditingMessage(null)">キャンセル</button>
    </div>
    <commentInputField />
  </div>
</template>
<style scoped>

</style>