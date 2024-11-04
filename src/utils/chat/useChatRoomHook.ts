import {child, get, getDatabase, onValue, push, ref as fireRef, set, update, query, orderByChild, equalTo} from 'firebase/database';
import type {User} from "firebase/auth";

export const useChatRoomHook = (user: User) => {
    const db = getDatabase();
    const messagesRef = fireRef(db, 'testChat/messages');
    const roomsRef = fireRef(db, 'testChat/rooms'); // roomIdをキーにしてルーム名や参加者一覧を保持
    const usersRef = fireRef(db, 'testChat/users'); // userIdをキーにして参加しているroom一覧を保持


    // 非正規化しているのでRoom側User側両方を変更することを忘れないように
    const createChatRoom = async (roomName: string | null = null) => {
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
        await set(newRoomRef, roomData)
        await update(child(usersRef, user.uid), {
            [roomId]: true
        });
        return roomId;
    }


    const createDMRoom = async (targetUserId: string) => {
        const roomId = await createChatRoom();
        if (!roomId) throw new Error('チャットルームの作成に失敗しました');
        await addUserToChatRoom(roomId, targetUserId);
        return roomId;
    }


    const addUserToChatRoom = async (roomId: string, userId: string) => {
        await update(child(roomsRef, roomId + "/users"), {
            [userId]: true
        });
        await update(child(usersRef, userId), {
            [roomId]: true
        });
    }

    const leaveChatRoom = async (roomId: string) => {

        if (user === null) return;
        await update(child(roomsRef, roomId + "/users"), {
            [user.uid]: null
        });
        await update(child(usersRef, user.uid), {
            [roomId]: null
        });
    }


    const deleteChatRoom = async (roomId: string) => {
        if (user === null) return

        // そのルームに属しているユーザーを取得
        const users = await get(child(roomsRef, roomId + "/users"));
        if (!users.exists()) return;

        // そのルームに属しているユーザーのroom一覧からそのルームを削除
        users.forEach((user) => {
            update(child(usersRef, user.key), {
                [roomId]: null
            });
        });

        // そのルーム自体のデータを削除
        await update(roomsRef, {
            [roomId]: null
        });

        // そのルームに属しているメッセージを削除
        const q = query(messagesRef, orderByChild('roomId'), equalTo(roomId))
        await set(q, null);
    }

    // ログイン中のユーザーが参加しているroom一覧を一度だけ取得してコールバックを呼ぶ
    const getJoinedRoomsOnce = async () => {
        const joinedRoomsRef = child(usersRef, user.uid);
        return get(joinedRoomsRef).then((snapshot) => { // /usersでログイン中のユーザーが参加しているroom一覧を取得
            return get(roomsRef, snapshot.key).then((roomSnapshot) => { // 取得したroom一覧からそれぞれのroomの情報を取得
                return roomSnapshot.val();
            });
        })
    };


    const getRooms = (callback: (value: any)=>void) => {
        return onValue(roomsRef, (snapshot) => {
            callback(snapshot.val());
        });
    }

    return {
        createDMRoom, createChatRoom, addUserToChatRoom, leaveChatRoom, deleteChatRoom, getJoinedRoomsOnce, getRooms
    }
}