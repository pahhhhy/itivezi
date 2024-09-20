import {getDownloadURL, getStorage, ref as storageRef} from "firebase/storage";
import {readUserData} from "@/utils/database";

export const getUserIconURL = (userId: string): Promise<string | null> => {
    const storage = getStorage();
    const imageRef = storageRef(storage, `profile_pictures/${userId}`);
    return getDownloadURL(imageRef).then((url) => {
        return url;
    }).catch((error) => {
        console.error('エラーが発生しました:', error)
        return null;
    });
}

export const getUserName = (userId: string): Promise<string | null> => {
    return readUserData(userId, "name");
}