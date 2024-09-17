import {child, get, getDatabase, push, ref as fireRef, set, update} from 'firebase/database';
import type {User} from "firebase/auth";

export const useChatRoomHook = (user: User) => {
    const db = getDatabase();
    const roomsRef = fireRef(db, 'testChat/rooms'); // roomIdをキーにしてルーム名や参加者一覧を保持
    const usersRef = fireRef(db, 'testChat/users'); // userIdをキーにして参加しているroom一覧を保持


    // 非正規化しているのでRoom側User側両方を変更することを忘れないように
    const createChatRoom = (roomName: string | null = null) => {
        if (user === null) return;

        const newRoomRef = push(roomsRef);
        const roomId = newRoomRef.key;
        if (!roomId) throw new Error('新規roomの作成に失敗しました');
        const roomData = {
            roomId: roomId,
            roomName: roomName,
            users: {
                [user.uid]: true
            }
        }
        set(newRoomRef, roomData)
        update(child(usersRef, user.uid), {
            [roomId]: true
        });
        return roomId;
    }


    const createDMRoom = (targetUserId: string) => {
        const roomId = createChatRoom();
        if (!roomId) throw new Error('チャットルームの作成に失敗しました');
        addUserToChatRoom(roomId, targetUserId);
        return roomId;
    }


    const addUserToChatRoom = (roomId: string, userId: string) => {
        update(child(roomsRef, roomId + "/users"), {
            [userId]: true
        });
        update(child(usersRef, userId), {
            [roomId]: true
        });
    }

    const leaveChatRoom = (roomId: string) => {

        if (user === null) return;
        update(child(roomsRef, roomId + "/users"), {
            [user.uid]: null
        });
        update(child(usersRef, user.uid), {
            [roomId]: null
        });
    }


    const deleteChatRoom = (roomId: string) => {
        if (user === null) return
        update(roomsRef, {
            [roomId]: null
        });
        update(usersRef, {
            [user.uid]: {
                [roomId]: null
            }
        });
    }

    // ログイン中のユーザーが参加しているroom一覧を一度だけ取得してコールバックを呼ぶ
    const getJoinedRoomsOnce = () => {
        const joinedRoomsRef = child(usersRef, user.uid);
        return get(joinedRoomsRef).then((snapshot) => { // /usersでログイン中のユーザーが参加しているroom一覧を取得
            return get(roomsRef, snapshot.key).then((roomSnapshot) => { // 取得したroom一覧からそれぞれのroomの情報を取得
                return roomSnapshot.val();
            });
        })
    };

    return {
        createDMRoom, createChatRoom, addUserToChatRoom, leaveChatRoom, deleteChatRoom, getJoinedRoomsOnce
    }
}