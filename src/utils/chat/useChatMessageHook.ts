import {ref as fireRef} from "@firebase/database";
import {
    child,
    endBefore,
    get,
    getDatabase,
    limitToLast,
    off,
    onChildAdded,
    onChildChanged,
    orderByChild,
    push,
    query,
    serverTimestamp,
    update
} from 'firebase/database'
import {onMounted, onUnmounted, ref} from "vue";
import type {ChatMessage} from "@/types/chat/chat";
import {ref as storageRef} from "@firebase/storage";
import {deleteObject, getStorage} from "firebase/storage";
import type {FirebaseError} from "firebase-admin";
import {type User} from "firebase/auth";


// 1回の更新で取得するメッセージ数
const MESSAGE_LIMIT = 20;

export const useChatMessageHook = (roomId: string, user: User, onMessageUpdated?: (data: Record<string, ChatMessage>) => void) => {
    const db = getDatabase();
    const messagesRef = fireRef(db, `testChat/messages/${roomId}`);// roomIdをキーにしてさらにmessageIdをキーにしたメッセージ情報を保持
    const roomsRef = fireRef(db, 'testChat/rooms');

    const messages = ref<ChatMessage[]>([]);
    const isEnd = ref(false);
    const myLastReadAt = ref<number | null>(null);

    const updatedHandler = (snapshot: any) => {
        // dataは{messageId: ChatMessage}の形式
        // roomIdがroomIdのものだけを取得する
        const rawData = snapshot.val();
        const data: Record<string, ChatMessage> = {[rawData.messageId]: rawData}

        if (data) {
            // すでにあるデータと統合
            messages.value = Object.values(data).reduce((acc: ChatMessage[], message: ChatMessage) => {
                const index = acc.findIndex((m) => m.messageId === message.messageId); // すでにあるデータのindexを取得
                if (index === -1) { // すでにあるデータから取得できなければ新しいデータ
                    // もし最終閲覧日時よりも新しいメッセージだった場合はそのまま追加
                    if (myLastReadAt.value && message.createdAt as number > myLastReadAt.value) {
                        acc.push(message);
                    }
                    // 最終閲覧日時よりも古くてかつ取得できないデータは表示されていないデータとみなせるので無視
                } else { // 取得できれば上書き
                    acc[index] = message;
                }
                return acc;
            }, messages.value); // 初期値はmessages.value
            messages.value.sort((a, b) => (a.createdAt as number) - (b.createdAt as number)); // 日時順にソート

            if (onMessageUpdated) onMessageUpdated(data);
        }
    }

    onMounted(async () => {
        // 自分の最終閲覧日時をまず取得(更新ではない)
        myLastReadAt.value = await getMyLastReadAtFromDB();

        await readMoreMessages();

        onChildChanged(messagesRef, updatedHandler);
        // 最新の1件だけはonChildAddedで取得
        const q = query(messagesRef, orderByChild('createdAt'), limitToLast(1));
        onChildAdded(q, updatedHandler);
    });

    onUnmounted(() => {
        if (messagesRef) {
            off(messagesRef, 'child_added', updatedHandler);
            off(messagesRef, 'child_changed', updatedHandler);
        }
    });

    // 自分の最終閲覧日時を取得
    const getMyLastReadAtFromDB = async () => {
        const snapshot = await get(child(roomsRef, roomId + '/lastReadAt/' + user.uid));
        return snapshot.val();
    }

    // 最終閲覧日時を更新
    const checkUpdateLastReadAt = async () => {
        messages.value.sort((a, b) => (a.createdAt as number) - (b.createdAt as number)); // 日時順にソート
        // messagesの最新のもののtimestampを取得
        const latestMessage = messages.value[messages.value.length - 1];
        if (!latestMessage) return;
        if (myLastReadAt.value && latestMessage.createdAt as number <= myLastReadAt.value) return;  // 最新のメッセージが最終閲覧日時よりも古い場合は更新しない
        // lastReadAtを更新
        await update(child(roomsRef, roomId + '/lastReadAt'), {
            [user.uid]: serverTimestamp()
        });
        myLastReadAt.value = latestMessage.createdAt as number;
    }

    const sendMessage = async (message: ChatMessage) => {
        const newMessageRef = push(messagesRef);
        if (!newMessageRef.key) return;
        message.messageId = newMessageRef.key;
        if (message.attachedFiles) {
            // ファイルをアップロードする処理
            Object.keys(message.attachedFiles).forEach((fileId) => {
                const file = message.attachedFiles![fileId];
                const fileRef = fireRef(db, `testChat/files/${roomId}/${newMessageRef.key}/${fileId}`);
                if (!newMessageRef.key) return;
                file.messageId = newMessageRef.key; // 空文字列だったmessageIdを更新
                update(fileRef, file);
            });
        }
        await update(newMessageRef, message);
        //     room側のlastMessageとlastUpdateAtを更新する
        await update(child(roomsRef, roomId), {
            lastMessage: message,
            lastUpdateAt: serverTimestamp() as object,
        });
        // 最終閲覧日時を更新
        // await checkUpdateLastReadAt();
    };

    const undoMessage = async (message: ChatMessage) => {
        // まず添付ファイルが有るかどうかを確認
        if (message.attachedFiles) {
            // ファイルを削除する処理
            for (const fileId of Object.keys(message.attachedFiles)) {
                // storageから削除
                const storageFileRef = storageRef(getStorage(), `chat/${roomId}/${fileId}`);
                try {
                    await deleteObject(storageFileRef);
                } catch (e) {
                    if ((e as FirebaseError).code !== 'storage/object-not-found') { // 存在しないファイルを削除しようとした場合は無視
                        throw e;
                    }
                }
                // dbから削除 (testChat/files/roomId/messageId/fileIdとtestChat/messages/messageId/fileUrlsの両方を削除)
                const chatRef = fireRef(db, 'testChat');
                await update(chatRef, {
                    [`files/${roomId}/${message.messageId}/${fileId}`]: null,
                    [`messages/${message.messageId}/attachedFiles/${fileId}`]: null,
                });
            }

        }
        // undoをtrueにしてmessageを空にする
        await update(child(messagesRef, message.messageId), {
            message: '',
            undo: true,
        })
    }

    const readMoreMessages = async () => {
        // messagesの最も古いものよりさらに古い20件を取得して配列の最初に追加
        if (messages.value.length === 0) {
            const q = query(messagesRef, orderByChild('createdAt'), limitToLast(MESSAGE_LIMIT));
            const snapshot = await get(q);
            const data: Record<string, ChatMessage> = snapshot.val();
            if (!data) {
                return;
            }
            messages.value = Object.values(data);
            messages.value.sort((a, b) => (a.createdAt as number) - (b.createdAt as number)); // 日時順にソート
            if (onMessageUpdated) onMessageUpdated(data);
        } else {
            const timestamp = messages.value[0].createdAt as number;
            const q = query(messagesRef, orderByChild('createdAt'), endBefore(timestamp), limitToLast(MESSAGE_LIMIT));
            const snapshot = await get(q);
            const data: Record<string, ChatMessage> = snapshot.val();
            // dataがnull(すでに先頭まで読み込んでいる)場合はフラグを立てる
            if (!data) {
                isEnd.value = true;
                return;
            }
            if (Object.keys(data).length < MESSAGE_LIMIT) {
                isEnd.value = true;
            }
            // 配列の最初に挿入
            messages.value = Object.values(data).concat(messages.value);
            messages.value.sort((a, b) => (a.createdAt as number) - (b.createdAt as number)); // 日時順にソート
            if (onMessageUpdated) onMessageUpdated(data);
        }

    }

    return {messages, isEnd, checkUpdateLastReadAt, sendMessage, undoMessage, readMoreMessages};
}