<script setup lang="ts">
import type {AnnouncementCommentWithViewData} from "@/types/announcement/announcementComments";
import KebabMenu from "@/views/components/common/kebabMenu.vue";
import {formatServerTimestamp} from "../../../utils/database";
import type {User} from "firebase/auth";
import {onMounted, ref} from "vue";
import {getUserIconURL, getUserName} from "@/utils/userData";

interface Props {
  user: User | null
  comment: AnnouncementCommentWithViewData
  commentHooks,
}

const {user, comment, commentHooks} = defineProps<Props>()


</script>
<template>
  <div
      :class="`comment ${commentHooks.replyingCommentId.value === comment.commentId? 'comment-replying': ''} ${commentHooks.editingCommentId.value === comment.commentId? 'comment-editing': ''} ${comment.replyTo? 'reply-comment': ''}`">
    <img :src="comment.userIconURL" alt="コメント投稿者アイコン">
    <div class="comment-text">
      <div class="comment-head">
        <p>{{ comment.userName }}</p>
        <p>{{ formatServerTimestamp(comment.createdAt) }}</p>
        <small v-if="comment.updatedAt">編集済 ({{ formatServerTimestamp(comment.updatedAt)}})</small>

        <KebabMenu class="kebab" v-if="comment.userId === user?.uid">
          <!--編集-->
          <button v-if="comment.userId === user?.uid" @click="commentHooks.setEditingMessage(comment)">編集</button>
          <!--削除-->
          <button v-if="comment.userId === user?.uid" @click="commentHooks.deleteComment(comment)">削除
          </button>

          <div v-if="commentHooks.replyingCommentId.value === comment.commentId">
          </div>
        </KebabMenu>

      </div>

      <div class="comment-content" v-html="comment.content">
      </div>

      <button v-if="!comment.replyTo" class="comment-reply-button" :disabled="!user?.uid"
              @click="commentHooks.setReplyingMessage(comment.commentId)">返信
      </button>
    </div>
  </div>
</template>
<style scoped>

.comment {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
  gap: 1rem;
  height: fit-content;
  padding: 1em;
}

.reply-comment {
  border-left: 1px solid black;
  padding-left: 1em;
  margin-left: 3em;
}

.comment > img {
  display: inline-block;
  width: 10%;
  aspect-ratio: 1;
  border-radius: 100%;
  flex-grow: 1;
}

.comment-head {
  display: flex;
  gap: 1em;
  flex-direction: row;
  width: 100%;
  height: 1.5em;
}

.comment-text {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  gap: .5em;
}

.comment-content {
  white-space: pre-wrap;
  word-wrap:break-word
}

.comment-replying {
  border: 1px dashed blue;
}
.comment-editing {
  border: 1px dashed green;
}

.comment-reply-button {
  margin-top: .1em;
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

</style>