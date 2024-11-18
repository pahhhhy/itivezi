<script setup lang="ts">
import { ref } from 'vue'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
interface Props {
  index:number
  vegeName:string
  uniquwKeys:string|null|number
}
interface Emits {
  (event: 'uproadImage', URL:string,index:number): void
}
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
// Firebase初期化済みの前提
const storage = getStorage();

// 画像のファイルデータを保持する
const file = ref<File | null>(null);

// アップロード後に取得するダウンロードURL
const downloadURL = ref<string | null>(null);

// ファイルが選択されたときにファイルデータを保持
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
  }
};

// 画像をFirebase Storageにアップロードする関数
const uploadImage = async () => {
  if (file.value) {
    // Firebase Storage のリファレンスを作成（例: images/ファイル名）
    const storageReference = storageRef(storage, `VegeImage/${props.vegeName}/${props.uniquwKeys}`);
    
    try {
      // ファイルを Firebase Storage にアップロード
      await uploadBytes(storageReference, file.value);
      
      // アップロードしたファイルのダウンロードURLを取得
      const url = await getDownloadURL(storageReference);
      downloadURL.value = url;
      emit("uproadImage",downloadURL.value,props.index)
      console.log('Download URL:', url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  } else {
    console.log("No file selected");
  }
};
</script>
<template>
<h4>画像を選択してください（任意）</h4>
<div>
    <form @submit.prevent="uploadImage">
      <input type="file" @change="handleFileChange" />
      <button type="submit">Upload</button>
    </form>
    <div v-if="downloadURL" class="uproad_image">
      <p>Image uploaded successfully!</p>
      <img :src="downloadURL" alt="Uploaded Image" />
    </div>
  </div>
</template>
<style scoped>
.uproad_image img{
  width: 300px;
  height: 200px;
}
</style>

