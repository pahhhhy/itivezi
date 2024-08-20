import {ref as fireRef} from "@firebase/database";
import {getDatabase, onValue} from "firebase/database";

// userIdを元にデータベースからユーザーデータを取得します。もしフィールド名が与えられたら場合そのフィールドのみ取得します。
export async function readUserData(userId: string, field?: string): Promise<any> {
    const userDataRef = fireRef(getDatabase(), 'testUser/' + userId + (field ? "/"+field : ''));
    return new Promise((resolve) => {
        let userData = null;
        onValue(userDataRef, (snapshot) => {
            userData = snapshot.val();
            resolve(userData);
        });
    })
}

