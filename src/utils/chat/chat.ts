import type {ChatRoom} from "@/types/chat/chat";
import {useUserDataStore} from "@/stores/userPublicData";

export const collectRoomName = (room: ChatRoom, ownUid: string) => {
    if (room.roomName) return room.roomName

    const {usersPublicData} = useUserDataStore()

    const users = Object.keys(room.users) // ルームに参加しているユーザーを取得
    const otherUsers = users.filter((u) => u !== ownUid) // 自分以外のユーザーを取得
    const otherUserNames = otherUsers.map((u: string) => // それらの表示名を取得
            (usersPublicData && usersPublicData[u]) ? usersPublicData[u].userName : u
        )
    return otherUserNames.join(", ")
}