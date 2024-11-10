import {ref as fireRef} from "@firebase/database";
import {
    child,
    equalTo,
    getDatabase,
    onValue,
    orderByChild,
    push,
    query,
    serverTimestamp,
    update
} from 'firebase/database'
import {onMounted, ref} from "vue";
import type {ChatMessage} from "@/types/chat/chat";

export const useChatMessageHook = (roomId: string, onMessageUpdated?: (data: Record<string, ChatMessage>) => void) => {
    const db = getDatabase();
    const messagesRef = fireRef(db, 'testChat/messages');// roomIdをキーにしてさらにmessageIdをキーにしたメッセージ情報を保持
    const roomsRef = fireRef(db, 'testChat/rooms');

    const messages = ref<ChatMessage[]>([]);

    onMounted(() => {
        const q = query(messagesRef, orderByChild('roomId'), equalTo(roomId));
        onValue(q, (snapshot) => {
            // dataは{messageId: ChatMessage}の形式
            // roomIdがroomIdのものだけを取得する
            const data: Record<string, ChatMessage> = snapshot.val();
            if (data) {
                messages.value = Object.values(data);
                if (onMessageUpdated) onMessageUpdated(data);
            }
        });
    });

    const sendMessage = async (message: ChatMessage) => {
        const newMessageRef = push(messagesRef);
        if (!newMessageRef.key) return;
        message.messageId = newMessageRef.key;
        await update(newMessageRef, message);
    //     room側のlastMessageとlastUpdateAtを更新する
        await update(child(roomsRef, roomId), {
            lastMessage: message,
            lastUpdateAt: serverTimestamp(),
        });
    };

    return {messages, sendMessage};


}