<script setup lang="ts">
import { ref } from 'vue'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
interface Props {
  index:number
  vegeName:string
  uniquwKeys:string|null|number
  photo:string|null
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
const downloadURL = ref<string | null>(props.photo);
console.log(downloadURL.value)
// ファイルが選択されたときにファイルデータを保持
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    await uploadImage()
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
<div class="imgform">
    <div class="changeimg_button">
      <label for="file-input"> 画像の挿入</label>
      <input type="file" id="file-input" @change="handleFileChange"  class="hidden-input"/>
    </div>
    <div  class="uproad_image">
      <img v-if="downloadURL&&downloadURL!='none' " :src="downloadURL" alt="Uploaded Image" />
      <img src="../../../assets/Noimage.jpeg" alt="..." v-if="downloadURL=='none'">
    </div>
  </div>
</template>
<style scoped>
.imgform{
  display: flex;
  width: 300px;
}
.uproad_image{
  margin-left: 10px;
  width: 100px;
  height: 50px;
}
.uproad_image img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.hidden-input {
  display: none;
}
.changeimg_button {
  display: flex;
  align-items: center;
}
.changeimg_button label{
  width: 100px;
  height: 30px;
  padding: 3px;
  background-color: var(--line-color);
  border-radius: 5px;
  text-align: center;
}
</style>

