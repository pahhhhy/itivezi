import {ref as fireRef} from "@firebase/database";
import {get, getDatabase, onValue} from "firebase/database";
import type {ServerTimestamp} from "@/types/announcement/announcement";

// userIdを元にデータベースからユーザーデータを取得します。もしフィールド名が与えられたら場合そのフィールドのみ取得します。
export async function readUserData(userId: string, field?: string): Promise<any> {
    const userDataRef = fireRef(getDatabase(), 'testUser/' + userId + (field ? "/"+field : ''));
    return new Promise((resolve) => {
        let userData = null;
        get(userDataRef, {source: 'cache'}).then((snapshot) => {
            userData = snapshot.val();
            resolve(userData);
        });
    })
}

// ServerTimestampからフォーマットされた日付を返します。
export function formatServerTimestamp(timestamp: ServerTimestamp): string {
    const date = new Date(timestamp as number);
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });

}
