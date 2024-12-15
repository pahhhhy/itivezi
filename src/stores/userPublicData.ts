import {defineStore} from "pinia";
import type {UserPublicData} from "@/types/common/userPublicData";
import {getUserIconURL, getUserName} from "@/utils/common/userData";
import {ref} from "vue";


// ユーザーidからそのユーザーのユーザー名, アイコン等を保持するストア。もしキャッシュがあればそこから返し, なければ都度取得するようにする.
export const useUserDataStore = defineStore("userData", () => {
        const usersPublicData = ref<Record<string, UserPublicData>>({});

        const getUserPublicData = async (userId: string) => {
            if (!userId) {
                return null;
            }
            const user = usersPublicData.value[userId];
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

            usersPublicData.value = {
                ...usersPublicData.value,
                [userId]: userData
            }

            return userData;
        }

        return {
            usersPublicData,
            getUserPublicData,
        }
    }
)