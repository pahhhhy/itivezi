export const storageURLPattern = "https://firebasestorage.googleapis.com/v0/b/blaze-lab-75c62.appspot.com/";

export interface FileData {
    file: File;
    content: string;
}

export interface FileInfo {
    id: string,
    url: string,
}