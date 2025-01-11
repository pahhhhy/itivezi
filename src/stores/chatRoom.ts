import {defineStore} from "pinia";
import type {ChatRoomWithUnreadCount} from "@/types/chat/chat";
import {ref} from "vue";
import router from "@/router";


// ユーザーidからそのユーザーのユーザー名, アイコン等を保持するストア。もしキャッシュがあればそこから返し, なければ都度取得するようにする.
export const useChatRoomStore = defineStore('chatRoom', () => {
    const chatRooms = ref<ChatRoomWithUnreadCount[]>([]);
    const currentRoom = ref<ChatRoomWithUnreadCount | null>(null);
    const totalUnreadCount = ref(0);


    // 現在のチャットルームを設定する
    const setCurrentRoom = (roomId: string | ChatRoomWithUnreadCount | null) => {
        if (typeof roomId === "string") {
            const room = getChatRoomData(roomId);
            if (!room) {
                console.warn("Room not found");
                router.push("/chat");
                return;
            }
            currentRoom.value = room;
        } else {
            currentRoom.value = roomId;
        }
    }

    // 現在のチャットルームをクリアする
    const clearCurrentRoom = () => {
        currentRoom.value = null;
    }

    // 現在のチャットルームを取得する
    const getCurrentRoom = () => {
        return currentRoom.value;
    }

    // チャットルームの情報を更新する
    const updateChatRoomData = (room: ChatRoomWithUnreadCount | ChatRoomWithUnreadCount[]) => {
        if (!Array.isArray(room)) {
            room = [room];
        }
        room.forEach((r: ChatRoomWithUnreadCount) => {
            const index = chatRooms.value.findIndex(room => room.roomId === r.roomId); // ルームIDが一致するものを探す
            if (index !== -1) {  // 見つかった場合
                chatRooms.value.splice(index, 1, r); // ルーム情報を更新

                if (currentRoom.value?.roomId === r.roomId) { // 現在のチャットルームが更新されたなら
                    currentRoom.value = r; // 適用
                }

            } else {  // 見つからなかった場合
                chatRooms.value.push(r); // ルーム情報を追加
            }
            updateTotalUnreadCount();

        });
    }

    // チャットルームの情報を削除する
    const removeChatRoomData = (roomId: string) => {
        const index = chatRooms.value.findIndex(r => r.roomId === roomId); // ルームIDが一致するものを探す
        if (index !== -1) {  // 見つかった場合
            chatRooms.value.splice(index, 1); // ルーム情報を削除
        }
        updateTotalUnreadCount();
    }

    // チャットルームの情報を取得する
    const getChatRoomData = (roomId: string) => {
        return chatRooms.value.find(r => r.roomId === roomId); // ルームIDが一致するものを探す
    }


    // チャットルームの情報をクリアする
    const clearChatRoomData = () => {
        chatRooms.value = [];
    }

    // 自分が参加しているルーム全てでの総未読数を更新する
    const updateTotalUnreadCount = () => {
        totalUnreadCount.value = chatRooms.value.reduce((acc, room) => acc + room.unreadCount, 0);
    }


    return {
        chatRooms,
        currentRoom,
        totalUnreadCount,
        setCurrentRoom,
        clearCurrentRoom,
        getCurrentRoom,
        updateChatRoomData,
        removeChatRoomData,
        getChatRoomData,
        clearChatRoomData,
    }
});