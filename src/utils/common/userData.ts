import {getDownloadURL, getStorage, ref as storageRef} from "firebase/storage";
import {readUserData} from "@/utils/database";

export const getUserIconURL = (userId: string): Promise<string | null> => {
    const storage = getStorage();
    const imageRef = storageRef(storage, `profile_pictures/${userId}`);
    return getDownloadURL(imageRef).then((url) => {
        return url;
    }).catch((error) => {
        const defaultImageRef = storageRef(storage, `profile_pictures/default.webp`);
        return getDownloadURL(defaultImageRef).then((url) => {
            return url;
        }).catch((error) => {
            console.error("Failed to get default image URL", error);
            return null;
        });
    });
}

export const getUserName = (userId: string): Promise<string | null> => {
    return readUserData(userId, "name");
}

