<script setup lang="ts">
import type {AnnouncementCommentWithViewData} from "@/types/announcement/announcementComments";
import KebabMenu from "@/views/components/common/KebabMenu.vue";
import {formatServerTimestamp} from '@/utils/database';
import type {User} from "firebase/auth";
import {useAnnouncementCommentEditor} from "@/utils/announcement/useAnnouncementCommentEditorHook";

interface Props {
  user: User | null
  comment: AnnouncementCommentWithViewData
  commentHooks: ReturnType<typeof useAnnouncementCommentEditor>
}

const {user, comment, commentHooks} = defineProps<Props>()


</script>
<template>
  <div
      :class="[
          'comment',
          commentHooks.replyingCommentId.value === comment.commentId && 'comment-replying',
          commentHooks.editingCommentId.value === comment.commentId&& 'comment-editing',
          comment.replyTo && 'reply-comment',
        ]"
  >
    <IconLeftUpArrow v-if="comment.replyTo" width="20" height="20"/>
    <img :src="comment.userIconURL ?? undefined" alt="">
    <div class="comment-right">
      <p class="comment-author-name">{{ comment.userName }}</p>
      <p class="comment-timestamp">{{ formatServerTimestamp(comment.createdAt, 'yyyy/MM/dd hh:mm') }}
        <small v-if="comment.updatedAt"> 編集済</small>
      </p>

      <KebabMenu class="comment-menu kebab" v-if="comment.userId === user?.uid">
        <!--編集-->
        <button v-if="comment.userId === user?.uid" @click="commentHooks.setEditingMessage(comment)">
          <IconPen />編集</button>
        <!--削除-->
        <button v-if="comment.userId === user?.uid" @click="commentHooks.deleteComment(comment)">
          <IconDelete />削除
        </button>

        <div v-if="commentHooks.replyingCommentId.value === comment.commentId">
        </div>
      </KebabMenu>

      <div class="comment-content" v-html="comment.content"/>
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
  gap: .5rem;
  height: fit-content;
  padding: 1em;
}

.reply-comment {
  padding: 0;
  margin-top: 0;
  margin-left: 2em;
}

.comment > img {
  display: inline-block;
  margin-top: 6px;
  width: 40px;
  aspect-ratio: 1;
  border-radius: 100%;
  flex-grow: 1;
}

.comment-right {
  width: 100%;
  height: fit-content;
  display: grid;
  grid-template-columns: 1fr 3em;
  grid-template-rows: repeat(2, 1.5em) 1fr 1.5em;
  grid-column-gap: 0;
  grid-row-gap: 0;

  .comment-author-name {
    grid-area: 1 / 1 / 2 / 2;
  }

  .comment-timestamp {
    grid-area: 2 / 1 / 3 / 2;
    font-size: .75em;
    margin: 0;

    small {
      margin-left: 1em;
      color: gray;
    }
  }

  .comment-menu {
    grid-area: 1 / 2 / 3 / 3;
  }

  .comment-content {
    grid-area: 3 / 1 / 4 / 3;
    white-space: pre-wrap;
    word-wrap: break-word;
    padding: 0 0 0 4px;
    margin: 0;
  }

  .comment-reply-button {
    grid-area: 4 / 1 / 7 / 3;
    display: inline-block;
    margin-top: .1em;
    border: none;
    background: none;
    text-align: left;
    padding: 0;
    /* colorはURLの色 */
    color: #0000ee;
    font-size: .75em;
    width: fit-content;
    cursor: pointer;
  }
}


.comment-replying {
  border: 1px dashed blue;
}

.comment-editing {
  border: 1px dashed green;
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
  border: none;
  background: none;
}

</style>