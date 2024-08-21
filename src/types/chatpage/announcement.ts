export interface Announcement {
    announceId: string;
    title: string;
    content: string;
    createdAt: ServerTimestamp;
    updatedAt?: ServerTimestamp;
    userID: string;
    categoryID: string;
}

export type ServerTimestamp = object | number; // set時にはserverTimestamp()を使用のこと。firebaseに送る前はobject, 取得したものはnumber型になっている。
