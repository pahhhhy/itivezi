// export const adminUid = 'tj0ekR3hzjaJFqx8YqWC4xho9Si1' // TODO: 完成したときには置き換え
export const adminUid = 'rxWBnJpWsZflRNJjuOJxW0JY2N82' // TODO: 完成したときには置き換え

export interface ChatRoom {
    roomId: string;
    roomName: string | null;
    users: Record<string, boolean>;
}

export interface ChatUser {
    rooms: Record<string, boolean>;
}