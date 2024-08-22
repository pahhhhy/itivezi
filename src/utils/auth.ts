import {onAuthStateChanged, type User, type Auth} from "firebase/auth";
import type {Role} from "@/types/auth";
import {readUserData} from "@/utils/database";

/**
 * ログイン中のユーザーを非同期で取得します。ログインしていない場合はnullを返します。
 * @param auth getAuth()で取得したものを渡してください。
 */
export const getCurrentUser: (auth: Auth) => Promise<User | null> = (auth) => new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
        let resultUser = null;
        if (user != null && user.emailVerified) {
            resultUser = user;
        }
        unsub()
        resolve(resultUser)
    })
})


/**
 * ログイン中のユーザーのロールを非同期で取得します。ログインしていない場合やデータベースに記載がない場合はnullを返します。
 * @param auth getAuth()で取得したものを渡してください。
 */
export const getCurrentRole: (auth: Auth) => Promise<Role> = async (auth) => {
    let role: Role = null;
    const user = await getCurrentUser(auth);
    if (user != null) {
        role = await readUserData(user.uid, "role");
    }
    return role;
}