import type {DatabaseReference} from "firebase/database";
import {child, push, update} from "firebase/database";
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
    return update(announcementRef, pushData)
}

export const deleteAnnouncementComment = (announcementRef: DatabaseReference, commentId: string) => {
    return update(announcementRef, {
        [`/comments/${commentId}`]: null
    })
}

export const addAnnouncementCommentReply = (announcementRef: DatabaseReference, replyingCommentId: string, replyData: Omit<AnnouncementComment, "commentId">) => {
    const newCommentKey = push(child(announcementRef, `comments/${replyingCommentId}/replies`)).key
    if (!newCommentKey) {
        throw new Error('Failed to push new comment')
    }
    const updatedReplyData = {...replyData, commentId: newCommentKey}
    const pushData = {
        [`/comments/${replyingCommentId}/replies/${newCommentKey}`]: updatedReplyData
    }
    return update(announcementRef, pushData)
}