import {getDownloadURL, getStorage, ref as storageRef} from "firebase/storage";
import {readUserData} from "@/utils/database";

export const getUserIconURL = async (userId: string): Promise<string | null> => {
    const storage = getStorage();
    const imageRef = storageRef(storage, `profile_pictures/${userId}`);
    let url = "";
    try {
        url = await getDownloadURL(imageRef);
    } catch {
        const defaultImageRef = storageRef(storage, `profile_pictures/default.webp`);
        url = await getDownloadURL(defaultImageRef);

    }

    return url;
}

export const getUserName = (userId: string): Promise<string | null> => {
    return readUserData(userId, "name");
}

