import {type DatabaseReference, serverTimestamp} from "firebase/database";
import {
    addAnnouncementComment,
    addAnnouncementCommentReply,
    deleteAnnouncementComment, editAnnouncementComment
} from "@/utils/announcement/announcementComments";
import type {User} from "firebase/auth";
import {defineComponent, h, ref, type Ref} from "vue";
import smallTextInputField from "@/views/components/common/smallTextInputField.vue";
import type {AnnouncementCommentType} from "@/types/announcement/announcementComments";

export const useAnnouncementCommentEditor = (announcementRef: DatabaseReference, user: Ref<User | null>) => {
    // 返信しようとしているコメント(返信先)のID (nullは返信しようとしていないことを表す)
    const replyingCommentId = ref<string | null>(null);

    // 編集しようとしているコメントのID (nullは編集しようとしていないことを表す)
    const editingCommentId = ref<string | null>(null);

    // 下の入力欄の内容
    const commentContent = ref<string>('');


    // ----- コメント関連 -----
    const sendComment = () => {
        if (!user.value || !commentContent.value) return;

        if (replyingCommentId.value) { // 返信中だったなら
            const data = {
                content: commentContent.value,
                createdAt: serverTimestamp(),
                userId: user.value.uid,
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
                userId: user.value.uid,
                replies: [],
            }
            addAnnouncementComment(announcementRef, data);
        }
        commentContent.value = '';
    }

    const editComment = () => {

    }

    const deleteComment = (comment: AnnouncementCommentType) => {
        if (!user.value) return;
        deleteAnnouncementComment(announcementRef, comment);
    }


    // ----- 返信関連 -----
    const setReplyingMessage = (targetCommentId: string | null) => {
        editingCommentId.value = null;
        replyingCommentId.value = targetCommentId;
    }

    // ----- 編集関連 -----
    const setEditingMessage = (comment: AnnouncementCommentType | null) => {
        replyingCommentId.value = null;
        editingCommentId.value = comment ? comment.commentId : null;
        commentContent.value = comment ? comment.content : '';
    }

    // ----- 入力欄コンポーネント -----
    const commentEditor = () => h(smallTextInputField, {
        // modelValueとonUpdate:modelValueを使ってv-modelを実現
        modelValue: commentContent.value,
        "onUpdate:modelValue": (val: string) => {
            commentContent.value = val;
        },
        onSendClicked: sendComment,
    })
    // 仮想ノードをコンポーネントにする
    const commentInputField = defineComponent({render: commentEditor,});


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