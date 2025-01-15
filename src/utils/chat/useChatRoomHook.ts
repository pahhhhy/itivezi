import {
    child,
    equalTo,
    get,
    getDatabase,
    onValue,
    orderByChild,
    push,
    query,
    ref as fireRef,
    serverTimestamp,
    set,
    startAt,
    update
} from 'firebase/database'
import type {User} from 'firebase/auth'
import type {ChatRoom, ChatRoomWithUnreadCount} from '@/types/chat/chat'
import {useUserDataStore} from "@/stores/userPublicData";
import {useChatRoomStore} from "@/stores/chatRoom";
import {deleteObject, getStorage, listAll, ref as storageRef} from "firebase/storage";

export const useChatRoomHook = (user: User) => {
    const db = getDatabase()
    const storage = getStorage()
    const messagesRootRef = fireRef(db, 'Chat/messages')
    const roomsRef = fireRef(db, 'Chat/rooms') // roomIdをキーにしてルーム名や参加者一覧を保持
    const usersRef = fireRef(db, 'Chat/users') // userIdをキーにして参加しているroom一覧を保持
    const filesRef = fireRef(db, 'Chat/files') // roomIdをキーにしてファイル一覧を保持

    // piniaのuseUserStoreから登場ユーザーをすべて取得
    const {getUserPublicData} = useUserDataStore()
    const {updateChatRoomData} = useChatRoomStore()


    // 非正規化しているのでRoom側User側両方を変更することを忘れないように
    const createChatRoom = async (roomName: string | null = null) => {
        if (user === null) return

        const newRoomRef = push(roomsRef)
        const roomId = newRoomRef.key
        if (!roomId) throw new Error('新規roomの作成に失敗しました')
        const roomData: ChatRoom = {
            roomId: roomId,
            roomName: roomName,
            createdAt: serverTimestamp(),
            users: {
                [user.uid]: true
            },
            lastReadAt: {
                [user.uid]: serverTimestamp()
            }
        }
        await set(newRoomRef, roomData)
        await update(child(usersRef, user.uid), {
            [roomId]: true
        })

        updateChatRoomData({
            ...roomData,
            unreadCount: 0
        })

        return roomId
    }

    const createDMRoom = async (targetUserId: string) => {
        const roomId = await createChatRoom()
        if (!roomId) throw new Error('チャットルームの作成に失敗しました')
        await addUserToChatRoom(roomId, targetUserId)
        return roomId
    }

    const addUserToChatRoom = async (roomId: string, userId: string) => {
        await update(child(roomsRef, roomId + '/users'), {
            [userId]: true
        })
        await update(child(usersRef, userId), {
            [roomId]: true
        })
    }

    const removeUserFromChatRoom = async (roomId: string, userId: string) => {
        await update(child(roomsRef, roomId + '/users'), {
            [userId]: null
        })
        await update(child(usersRef, userId), {
            [roomId]: null
        })
    }

    const leaveChatRoom = async (roomId: string) => {
        if (user === null) return
        await update(child(roomsRef, roomId + '/users'), {
            [user.uid]: null
        })
        await update(child(usersRef, user.uid), {
            [roomId]: null
        })
    }

    const deleteChatRoom = async (roomId: string) => {
        if (user === null) return

        // そのルームに属しているユーザーを取得
        const users = await get(child(roomsRef, roomId + '/users'))
        if (users.exists()) {
            // そのルームに属しているユーザーのroom一覧からそのルームを削除
            users.forEach((user) => {
                update(child(usersRef, user.key), {
                    [roomId]: null
                })
            })
        }
        // そのルーム自体のデータを削除
        await update(roomsRef, {
            [roomId]: null
        })

        // そのルームに属しているメッセージを削除
        // messages/roomIdにあるので、roomIdごと削除
        await update(messagesRootRef, {
            [roomId]: null
        })

        // filesの画像も削除
        // Chat/files/roomIdにあるので、roomIdごと削除
        await update(filesRef, {
            [roomId]: null
        })


        // storageの画像も削除
        const roomImagesRef = storageRef(storage, 'Chat/' + roomId)
        const res = await listAll(roomImagesRef)
        res.items.forEach((itemRef) => {
            deleteObject(itemRef)
        })

    }

    const getJoinedRooms = (callback: (chatRooms: ChatRoomWithUnreadCount[]) => void) => {

        // roomsのうち、/usersの中にuser.uidが含まれているものを取得
        const q = query(roomsRef, orderByChild('users/' + user.uid), equalTo(true))
        return onValue(q, async (snapshot) => {
            if (!snapshot.exists()) {
                callback([])
                return
            }
            const data = snapshot.val()
            const chatRooms: ChatRoom[] = Object.keys(data).map((key) => data[key])

            // 関係のあるユーザー(参加中のルームに参加しているすべての他のユーザー)のIDからユーザー情報を取得しておく
            const allRelatedUsers = Array.from(new Set(chatRooms.map((room) => Object.keys(room.users)).flat())) // 重複排除
            allRelatedUsers.forEach((uid: string) => {
                getUserPublicData(uid);
            })

            // 未読件数について走査
            const chatRoomsWithUnreadCount: ChatRoomWithUnreadCount[] = []
            for (const room of chatRooms) {
                const processedRoom: ChatRoomWithUnreadCount = {
                    ...room,
                    unreadCount: 0
                }
                if (processedRoom.lastUpdateAt && (processedRoom.lastReadAt[user.uid] as number ?? 0) < (processedRoom.lastUpdateAt as number)) { // 最終閲覧日時が最終更新日時よりも古い場合
                    processedRoom.unreadCount = await getUnreadCount(processedRoom) // 未読数を取得
                } else {
                    processedRoom.unreadCount = 0
                }
                chatRoomsWithUnreadCount.push(processedRoom)
            }

            callback(chatRoomsWithUnreadCount)
            updateChatRoomData(chatRoomsWithUnreadCount)
        })


    }

    const getAllRooms = (callback: (value: any) => void) => {
        return onValue(roomsRef, (snapshot) => {
            callback(snapshot.val())
        })
    }

    // あるルームの未読件数を取得
    const getUnreadCount = async (room: ChatRoomWithUnreadCount) => {
        const lastReadAt: number = room.lastReadAt[user.uid] as number ?? 0

        const messagesRef = fireRef(db, 'Chat/messages/' + room.roomId)
        // 最終閲覧日時より新しいメッセージを取得
        const q = query(messagesRef, orderByChild('createdAt'), startAt(lastReadAt))
        const snapshot = await get(q)
        const messages = snapshot.val()
        if (!messages) return 0

        return Object.keys(messages).length;
    }

    const updateRoomName = async (roomId: string, roomName: string | null) => {
        await update(child(roomsRef, roomId), {
            roomName: roomName
        })
    }

    // ある特定の人とのDMルームが存在するかどうかを確認、存在する場合はそのroomIdを返す
    const checkDMRoomExists = async (targetUserId: string) => {

        // 自分が参加している全てのルームidを取得
        const joinedRooms = await get(child(usersRef, user.uid))
        if (!joinedRooms.exists()) return null
        const roomIds = Object.keys(joinedRooms.val())

        // それらのルーム情報を取得
        for (const roomId of roomIds) {
            const roomUsers = await get(child(roomsRef, roomId + '/users'))
            if (!roomUsers.exists()) continue
            const users = Object.keys(roomUsers.val())
            if (users.length !== 2) continue
            if (users.includes(targetUserId)) {
                return roomId
            }
        }

    }

    return {
        createDMRoom,
        createChatRoom,
        addUserToChatRoom,
        removeUserFromChatRoom,
        leaveChatRoom,
        deleteChatRoom,
        getJoinedRooms,
        getRooms: getAllRooms,
        getUnreadCount,
        updateRoomName,
        checkDMRoomExists,
    }
}
