import {ref as fireRef} from "@firebase/database";
import {getDatabase} from "firebase/database";

export const useChatMessageHook = () => {
    const db = getDatabase();
    const messagesRef = fireRef(db, 'testChat/messages');// roomIdをキーにしてさらにmessageIdをキーにしたメッセージ情報を保持

}