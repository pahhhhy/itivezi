import type { FileData, FileInfo } from '@/types/files'
import { v4 as uuid } from 'uuid'
import {
  deleteObject,
  type FirebaseStorage,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable
} from 'firebase/storage'

export const uploadImg = async (
  storageInstance: FirebaseStorage,
  fileData: FileData,
  files: FileInfo[]
) => {
  const id = uuid()
  const imageStorageRef = storageRef(storageInstance, `testImages/${id}`)
  const uploadTask = await uploadBytesResumable(imageStorageRef, fileData.file)

  const url = await getDownloadURL(uploadTask.ref)
  const reg = new RegExp(`!\\[.*]\\(\\d*\\)`, 'g')
  const afterContent = fileData.content.replace(reg, `![image](${url})`)
  const afterFiles = [...files, { id, url }]
  return { afterContent, afterFiles }
}

export const deleteImgFromStorage = (
  storageInstance: FirebaseStorage,
  deletedFiles: FileInfo[]
) => {
  deletedFiles.forEach(async (file) => {
    const deleteImgStorageRef = storageRef(storageInstance, `testImages/${file.id}`)
    deleteObject(deleteImgStorageRef)
      .then(() => {})
      .catch((error) => {
        console.log('delete error')
        console.log(error)
      })
  })
}

export const splitFiles = (files: FileInfo[], content: string) => {
  //追加 ※1
  const existFiles: FileInfo[] = []
  const deleteFiles: FileInfo[] = []
  for (let i = 0; i < files.length; i++) {
    if (content.includes(files[i].url)) {
      existFiles.push(files[i])
    } else {
      deleteFiles.push(files[i])
    }
  }
  return { existFiles, deleteFiles }
}
