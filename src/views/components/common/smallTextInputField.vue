<script setup lang="ts">
import {ref} from "vue";
import type HTMLInputEvent from "@/types/common/HTMLInputEvent";

const message = defineModel<string>('message', {default: ""}); // refではなくdefineModelにすることでこのコンポーネントのv-modelを定義できる
const isSending = defineModel<boolean>('isSending');
const attachmentFiles = defineModel<File[]>('attachmentFiles', {default: undefined});

interface Props {
  isTextMode?: boolean
  placeholder: string
}

const {isTextMode, placeholder} = defineProps<Props>()


interface Emits {
  (event: 'fileChange', e: HTMLInputEvent | DragEvent): void,

  (event: 'send'): void
}

const emit = defineEmits<Emits>()

const send = () => {
  emit('send')
  inputFile!.value = null
  inputImg!.value = null
}

const inputImg = ref<null | HTMLInputElement>(null);
const inputFile = ref<null | HTMLInputElement>(null);
</script>
<template>
  <div class="input-area">
    <!-- 添付ファイル -->
    <div v-if="!isTextMode">
      <input
          type="file"
          multiple
          @change="emit('fileChange', $event as HTMLInputEvent | DragEvent)"
          id="file-input"
          ref="inputFile"
          style="display: none;"
          accept="application/pdf, video/*, image/*, audio/*"
      />
      <button type="button" @click="inputFile!.click();">
        <IconClip/>
      </button>
    </div>
    <!-- 画像 -->
    <div v-if="!isTextMode">
      <input
          type="file"
          accept="image/*"
          multiple
          @change="emit('fileChange', $event as HTMLInputEvent | DragEvent)"
          id="img-input"
          ref="inputImg"
          style="display: none;"
      />
      <button type="button" @click="inputImg!.click();">
        <IconPhoto/>
      </button>
    </div>
    <!-- テキスト -->
    <textarea type="text" v-model="message" :placeholder="placeholder" :disabled="isSending"></textarea>
    <!-- 送信ボタン -->
    <button class="send-button" @click="send" type="button"
            :disabled="isSending || !(message || (attachmentFiles && attachmentFiles.length))">
      <IconSend :color="isSending || !(message || (attachmentFiles && attachmentFiles.length)) ? 'gray' : '#000'"/>
    </button>
  </div>

</template>
<style scoped>

button {
  background: none;
  border: none;
}

.input-area {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: max-content;
  margin: 0 0 16px;
  padding-top: 16px;
}

textarea {
  /* textareaは自動拡張させる */
  resize: none;
  width: 100%;
  height: 100%;
  min-height: 40px;
  max-height: 160px;
  field-sizing: content;
  border-radius: 20px;
  padding: .4em 1em;


  & [disabled] {
    background-color: #f0f0f0;
  }
}

.send-button {
  position: relative;
  z-index: 1;

  svg {
    position: relative;
    z-index: -1;

  }

}

</style>