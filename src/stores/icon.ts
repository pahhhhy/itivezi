import { defineStore } from 'pinia';
import {  type User, updateProfile } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL ,deleteObject} from 'firebase/storage';

export const useIconStore = defineStore('iconURL', {
  state: () => ({
    iconURL: '',
  }),
  actions: {
    deleteURL() {
      this.iconURL = '';
    },
    initURL(currentUser: User) {
      if (currentUser?.photoURL) {
        this.iconURL = currentUser.photoURL;
      } else {
        console.error("IconStoreError: No photoURL available");
      }
    },
    // Firebase Storageに画像をアップロードし、プロフィール画像を更新
    async uploadImage(selectedImage: File | null, user: User) {
      if (!selectedImage) return;  // 画像が選択されていない場合は終了
      if (!user) return;  // ユーザーが存在しない場合は終了

      const storage = getStorage();
      const imageRef = storageRef(storage, `profile_pictures/${user.uid}`);

      try {
        // Firebase Storageに画像をアップロード
        await uploadBytes(imageRef, selectedImage);

        // アップロードした画像のURLを取得
        const downloadURL = await getDownloadURL(imageRef);

        // ユーザーのプロフィール画像を更新
        await updateProfile(user, { photoURL: downloadURL });

        // 表示するプロフィール画像を更新
        this.iconURL = downloadURL;
        alert('画像がアップロードされました');
      } catch (error) {
        console.error('画像アップロードエラー: ', error);
      }
    },
     // Firebase Authのプロフィール画像を削除
     async resetPhotoURL(user: User) {
        const storage = getStorage();
        const imageRef = storageRef(storage, `profile_pictures/${user.uid}`);
        try {
            await deleteObject(imageRef);
          // プロフィール画像を削除
          await updateProfile(user, { photoURL: null });
  
          // ストア内のアイコンURLもクリア
          this.iconURL = '';
            // 現在のユーザーを強制的に再取得
            await user.reload();
          // 成功メッセージを表示
          alert('プロフィール画像が削除されました');
        } catch (error) {
          console.error('プロフィール画像削除エラー: ', error);
        }
      },
    },
  },
);
