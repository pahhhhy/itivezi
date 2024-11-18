import {defineStore} from "pinia";
import type {UserPublicData} from "@/types/common/userPublicData";
import {getUserIconURL, getUserName} from "@/utils/common/userData";


// ユーザーidからそのユーザーのユーザー名, アイコン等を保持するストア。もしキャッシュがあればそこから返し, なければ都度取得するようにする.
export const useUserDataStore = defineStore({
    id: "userData",
    state: () => ({
        _users: [] as UserPublicData[]
    }),
    actions: {
        async getUserPublicData(userId: string) {
            if (!userId) {
                return null;
            }
            const user = this._users.find(user => user.uid === userId);
            if (user) {
                return user as UserPublicData;
            }

            const userData: UserPublicData = {
                uid: userId,
                userName: "",
                iconURL: "",
            };

            await getUserIconURL(userId).then((url) => {
                if (url !== null) userData.iconURL = url;
            })
            await getUserName(userId).then((name) => {
                if (name !== null) userData.userName = name;
            })

            this._users.push(userData);
            return userData;
        }
    },

});