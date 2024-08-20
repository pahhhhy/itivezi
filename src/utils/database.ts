import {ref as fireRef} from "@firebase/database";
import {getDatabase, onValue} from "firebase/database";
import type {Role} from "@/types/auth";

// userIdを元にデータベースからユーザーデータを取得します。
export function readUserData(userId: string): any {
    const userDataRef = fireRef(getDatabase(), 'testUser/' + userId);
    let userData: Role = null; // snapshot.val()はany型を返す
    onValue(userDataRef, (snapshot) => {
        userData = snapshot.val();
    });
    return userData;
}

