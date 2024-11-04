import {ref as fireRef} from "@firebase/database";
import {equalTo, getDatabase, onValue, orderByChild, push, query, update} from "firebase/database";
import {onMounted, ref} from "vue";
import type {ChatMessage} from "@/types/chat/chat";

export const useChatMessageHook = (roomId: string, onMessageUpdated?: (data: Record<string, ChatMessage>) => void) => {
    const db = getDatabase();
    const messagesRef = fireRef(db, 'testChat/messages');// roomIdをキーにしてさらにmessageIdをキーにしたメッセージ情報を保持

    const messages = ref([]);

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

    const sendMessage = async (message: Omit<ChatMessage, messageId>) => {
        const newMessageRef = push(messagesRef);
        message.messageId = newMessageRef.key;
        await update(newMessageRef, message);
    };

    return {messages, sendMessage};


}