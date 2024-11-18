import type {FileData, FileInfo} from "@/types/files";
import {createId as cuid} from "@paralleldrive/cuid2";
import {deleteObject, getDownloadURL, getStorage, ref as storageRef, uploadBytesResumable} from "firebase/storage";
import {ref} from "vue";

export const useAnnouncementFiles = () => {
    const content = ref<string>('');
    const files = ref<FileInfo[]>([]);
    const storage = getStorage();

    const imgAdd = async (_: string, imgFile: File) => { //追加 ※2
        const fileData = {file: imgFile, content: content.value,}
        const {afterContent, afterFiles} = await uploadImg(fileData, files.value);
        content.value = afterContent;
        files.value = afterFiles;
        console.log("Added")
    };

    const uploadImg = async (fileData: FileData, files: FileInfo[]) => {
        const id = cuid();
        const imageStorageRef = storageRef(storage, `testImages/${id}`);
        const uploadTask = await uploadBytesResumable(imageStorageRef, fileData.file);

        const url = await getDownloadURL(uploadTask.ref);
        const reg = new RegExp(`!\\[.*]\\(\\d*\\)`, 'g');
        const afterContent = fileData.content.replace(reg, `![${id}](${url})`);
        const afterFiles = [...files, {id, url}];
        return {afterContent, afterFiles};
    }

    const deleteImgFromStorage = (deletedFiles: FileInfo[]) => {
        deletedFiles.forEach(async (file) => {
        const deleteImgStorageRef = storageRef(storage, `testImages/${file.id}`);
            deleteObject(deleteImgStorageRef).then(() => {
            }).catch((error) => {
                console.log("delete error");
                console.log(error);
            });
        });
    }

    const splitFiles = (files: FileInfo[], content: string) => { //追加 ※1
        const existFiles: FileInfo[] = [];
        const deleteFiles: FileInfo[] = [];
        for (let i = 0; i < files.length; i++) {
            if (content.includes(files[i].url)) {
                existFiles.push(files[i])
            } else {
                deleteFiles.push(files[i])
            }
        }
        return {existFiles, deleteFiles}
    };

    return {files, content, imgAdd, deleteImgFromStorage, splitFiles};
}