import {type DatabaseReference, serverTimestamp} from "firebase/database";
import {
    addAnnouncementComment,
    addAnnouncementCommentReply,
    deleteAnnouncementComment, editAnnouncementComment
} from "@/utils/announcement/announcementComments";
import type {User} from "firebase/auth";
import {defineComponent, h, ref, type Ref, watch} from "vue";
import smallTextInputField from "@/views/components/common/SmallTextInputField.vue";
import type {AnnouncementCommentType} from "@/types/announcement/announcementComments";

export const useAnnouncementCommentEditor = (announcementRef: DatabaseReference, user: User) => {
    // 返信しようとしているコメント(返信先)のID (nullは返信しようとしていないことを表す)
    const replyingCommentId = ref<string | null>(null);

    // 編集しようとしているコメントのID (nullは編集しようとしていないことを表す)
    const editingCommentId = ref<string | null>(null);

    // 下の入力欄の内容
    const commentContent = ref<string>('');


    // ----- コメント関連 -----
    const sendComment = () => {
        if (!user || !commentContent.value) return;

        if (replyingCommentId.value) { // 返信中だったなら
            const data = {
                content: commentContent.value,
                createdAt: serverTimestamp(),
                userId: user.uid,
                replyTo: replyingCommentId.value,
            }
            addAnnouncementCommentReply(announcementRef, replyingCommentId.value, data);
            replyingCommentId.value = null;
        }else if (editingCommentId.value) { // 編集中だったなら
            editAnnouncementComment(announcementRef,editingCommentId.value, commentContent.value);
            setEditingMessage(null)
        } else { // 通常のコメントだったなら
            const data = {
                content: commentContent.value,
                createdAt: serverTimestamp(),
                userId: user.uid,
                replies: {},
            }
            addAnnouncementComment(announcementRef, data);
        }
        commentContent.value = '';
    }

    const editComment = () => {

    }

    const deleteComment = (comment: AnnouncementCommentType) => {
        if (!user) return;
        deleteAnnouncementComment(announcementRef, comment);
    }


    // ----- 返信関連 -----
    const setReplyingMessage = (targetCommentId: string | null) => {
        editingCommentId.value = null;
        replyingCommentId.value = targetCommentId;
    }

    // ----- 編集関連 -----
    const setEditingMessage = (comment: AnnouncementCommentType | null) => {
        // menuを閉じる

        replyingCommentId.value = null;
        editingCommentId.value = comment ? comment.commentId : null;
        commentContent.value = comment ? comment.content : '';
    }


    const isSending = ref(false);
    // ----- 入力欄コンポーネント -----
    const commentEditor = () => h(smallTextInputField, {
        isTextMode: true,
        placeholder: "コメントする",
        // textModeなのでattachedFileは使用しない
        // modelはpropとemitに分解
        message: commentContent.value,
        // emitは接頭辞にonをつけることで実装可能
        'onUpdate:message': (val: string) => {
            commentContent.value = val;
        },
        isSending: isSending.value,
        'onUpdate:isSending': (val: boolean) => {
            isSending.value = val;
        },
        onSend: sendComment,
    })
    // 仮想ノードをコンポーネントにする
    const commentInputField = defineComponent({render: commentEditor,});


    // TODO: スクロール改善, カテゴリごと記事取得, 記事編集, コメント編集ボタンデザイン, !入力時送信ボタン灰色にならない, ヘッダーのチャットの未読数


    return {
        replyingCommentId,
        editingCommentId,
        sendComment,
        editComment,
        deleteComment,
        setReplyingMessage,
        setEditingMessage,
        commentInputField,
    };
}