import type {ChatRoom} from "@/types/chat/chat";
import {useUserDataStore} from "@/stores/userPublicData";

export const collectRoomName = async (room: ChatRoom, ownUid: string) => {
    if (room.roomName) return room.roomName

    const {getUserPublicData} = useUserDataStore()

    const users = Object.keys(room.users) // ルームに参加しているユーザーを取得
    const otherUsers = users.filter((u) => u !== ownUid) // 自分以外のユーザーを取得
    if (otherUsers.length === 0) return "(無人のルーム)"
    return await( Promise.all(
        [...otherUsers.map(async (uid: string) => {// それらの表示名を取得
            const usersPublicData = await getUserPublicData(uid)
            return (usersPublicData) ? usersPublicData.userName : uid
        })]
    ).then((userNames) => userNames.join(', ')))
}