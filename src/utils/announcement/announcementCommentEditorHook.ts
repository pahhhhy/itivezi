import {type DatabaseReference, serverTimestamp} from "firebase/database";
import {
    addAnnouncementComment,
    addAnnouncementCommentReply,
    deleteAnnouncementComment
} from "@/utils/announcement/announcementComments";
import type {User} from "firebase/auth";
import {defineComponent, h, ref, type Ref} from "vue";
import mavonEditor from "mavon-editor";

export const useAnnouncementCommentEditor = (announcementRef: DatabaseReference, user: Ref<User | null>) => {
    // 返信しようとしているコメント(返信先)のID (nullは返信しようとしていないことを表す)
    const replyingCommentId = ref<string | null>(null);

    const commentContent = ref<string>('');
    const replyContent = ref<string>('');


    // ----- コメント関連 -----
    const addComment = () => {
        if (!user.value) return;
        const data = {
            content: commentContent.value,
            createdAt: serverTimestamp(),
            userId: user.value.uid,
            replies: [],
        }
        addAnnouncementComment(announcementRef, data);
    }

    const editComment = () => {

    }

    const deleteComment = (commentId: string) => {
        if (!user.value) return;
        deleteAnnouncementComment(announcementRef, commentId);
    }


    // ----- 返信関連 -----

    const setReplyingMessage = (targetCommentId: string | null) => {
        replyingCommentId.value = targetCommentId;
        replyContent.value = '';
    }

    const addReply = () => {
        if (!replyingCommentId.value || !user.value) return;
        console.log(replyContent.value);
        const data = {
            content: replyContent.value,
            createdAt: serverTimestamp(),
            userId: user.value.uid || '',
            replyTo: replyingCommentId.value,
        }
        addAnnouncementCommentReply(announcementRef, replyingCommentId.value, data);
    }



    // ----- 返信エディタコンポーネント -----

    const commentEditor = () => h(mavonEditor.mavonEditor, {
        // modelValueとonUpdate:modelValueを使ってv-modelを実現
        modelValue: commentContent.value,
        "onUpdate:modelValue": (val: string) => {
            commentContent.value = val;
        },
        language: "ja",
        placeholder: "ここにコメントを入力...",
    })
    // 仮想ノードをコンポーネントにする
    const commentEditorComponent = defineComponent({render: commentEditor,});


    // h()関数は仮想ノードを生成できるすぐれもの
    const replyEditor = () => h(mavonEditor.mavonEditor, {
        // modelValueとonUpdate:modelValueを使ってv-modelを実現
        modelValue: replyContent.value,
        "onUpdate:modelValue": (val: string) => {
            replyContent.value = val;
        },
        language: "ja",
        placeholder: "ここに返信を入力...",
    })
    // 仮想ノードをコンポーネントにする
    const replyEditorComponent = defineComponent({render: replyEditor,});

    return {
        replyContent,
        replyingCommentId,
        addComment,
        editComment,
        deleteComment,
        setReplyingMessage,
        addReply,
        commentEditorComponent,
        replyEditorComponent,
    };
}