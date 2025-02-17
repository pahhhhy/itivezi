import {ref as fireRef} from "@firebase/database";
import {get, getDatabase} from "firebase/database";
import type {ServerTimestamp} from "@/types/announcement/announcement";

// userIdを元にデータベースからユーザーデータを取得します。もしフィールド名が与えられたら場合そのフィールドのみ取得します。
export async function readUserData(userId: string, field?: string): Promise<any> {
    const userDataRef = fireRef(getDatabase(), 'testUser/' + userId + (field ? "/" + field : ''));
    return new Promise((resolve) => {
        let userData = null;
        get(userDataRef).then((snapshot) => {
            userData = snapshot.val();
            resolve(userData);
        });
    })
}

export async function getAdminUid(): Promise<string | null> {
    const adminUidRef = fireRef(getDatabase(), 'adminUid');
    return new Promise((resolve) => {
        let adminUid = null;
        get(adminUidRef).then((snapshot) => {
            adminUid = snapshot.val();
            resolve(adminUid);
        });
    })
}

// ServerTimestampからフォーマットされた日付を返します。
// formatが与えられたらそのフォーマットで返します。
// フォーマットにはyyyy, MM, dd, hh, mm, ss, sssが使用できます。
export function formatServerTimestamp(timestamp: ServerTimestamp, format?: string): string {
    const date = new Date(timestamp as number);

    // formatがあればそのフォーマットで返す
    if (format) {
        // 解析
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const millisecond = date.getMilliseconds();

        // フォーマット
        try {
            return format
                .replace('yyyy', year.toString())
                .replace('MM', month.toString().padStart(2, '0'))
                .replace('dd', day.toString().padStart(2, '0'))
                .replace('hh', hour.toString().padStart(2, '0'))
                .replace('mm', minute.toString().padStart(2, '0'))
                .replace('ss', second.toString().padStart(2, '0'))
                .replace('sss', millisecond.toString().padStart(3, '0'));
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    // 年月日 時:分
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });

}


