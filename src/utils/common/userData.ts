import {getDownloadURL, getStorage, ref as storageRef} from "firebase/storage";
import {readUserData} from "@/utils/database";

export const getUserIconURL = (userId: string): Promise<string | null> => {
    const storage = getStorage();
    const imageRef = storageRef(storage, `profile_pictures/${userId}`);
    return getDownloadURL(imageRef).then((url) => {
        return url;
    }).catch((error) => {
        if (error.code === 'storage/object-not-found') {
            console.debug('プロフィール画像が見つかりませんでした:', error)
        }
        console.error('エラーが発生しました:', error)
        return null;
    });
}

export const getUserName = (userId: string): Promise<string | null> => {
    return readUserData(userId, "name");
}

