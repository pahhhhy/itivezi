import type {DatabaseReference} from "firebase/database";
import {child, push, serverTimestamp, update} from "firebase/database";
import type {AnnouncementComment} from "@/types/announcement/announcementComments";


export const addAnnouncementComment = (announcementRef: DatabaseReference, commentData: Omit<AnnouncementComment, "commentId">) => {
    const newCommentKey = push(child(announcementRef, 'comments')).key
    if (!newCommentKey) {
        throw new Error('Failed to push new comment')
    }
    const updatedCommentData = {...commentData, commentId: newCommentKey}
    const pushData = {
        [`/comments/${newCommentKey}`]: updatedCommentData
    }
    update(announcementRef, pushData)
    return newCommentKey
}
export const editAnnouncementComment = (announcementRef: DatabaseReference, commentId: string, newContent: string) => {
    const pushData = {
        [`/comments/${commentId}/content`]: newContent,
        [`/comments/${commentId}/updatedAt`]: serverTimestamp()
    }
    return update(announcementRef, pushData)
}

export const deleteAnnouncementComment = (announcementRef: DatabaseReference, comment: AnnouncementComment) => {
    const pushData = {}
    if (comment.replies) { // もしこれに返信があるなら消す
        for (const replyId in comment.replies) {
            pushData[`/comments/${replyId}`] = null
        }
    }
    if (comment.replyTo) { // もしこれが返信なら親コメントのrepliesから消す
        pushData[`/comments/${comment.replyTo}/replies/${comment.commentId}`] = null
    }
    // 削除
    pushData[`/comments/${comment.commentId}`] = null

    return update(announcementRef, pushData)
}

export const addAnnouncementCommentReply = (announcementRef: DatabaseReference, replyingCommentId: string, replyData: Omit<AnnouncementComment, "commentId">) => {
    const newCommentKey = addAnnouncementComment(announcementRef, replyData);
    // replyされた方のコメントのrepliesに追加する
    const pushData = {
        [`/comments/${replyingCommentId}/replies/${newCommentKey}`]: true
    }
    return update(announcementRef, pushData)
}