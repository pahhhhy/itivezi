<script setup lang="ts">
const model = defineModel<string>() // refではなくdefineModelにすることでこのコンポーネントのv-modelを定義できる

// props
interface Props {
  onSendClicked: () => void
}

const {onSendClicked} = defineProps<Props>()

const setTextInputMatchHeight = () => {
  // https://qiita.com/mtoutside/items/8dce5699a2d0283664a2

  const textContents = document.getElementById('messageInput') as HTMLTextAreaElement;
  if (!textContents) return;
  // テキスト要素の高さを取得
  const textHeight = textContents.clientHeight;
  // テキスト要素のline-heightを取得
  let lineHeight = getComputedStyle(textContents).getPropertyValue('line-height');
  // [32.4px]のようなピクセル値が返ってくるので、数字だけにする
  lineHeight = lineHeight.replace(/[^-\d.]/g, '');
  // テキスト要素の行数を取得
  const lines = textContents.value.split('\n').length;
  // テキスト要素の高さを行数に応じて変更
  // textContents.style.height = `${textHeight + (lines - 1) * lineHeight}px`;
  // textareaのrows属性を行数に応じて変更
  textContents.rows = lines;
}

</script>
<template>
  <div class="messageBox">
    <textarea rows="1" required placeholder="コメントを入力..." id="messageInput"
              @focus="setTextInputMatchHeight()" @keyup="setTextInputMatchHeight()" @keydown="setTextInputMatchHeight()" @change="setTextInputMatchHeight"  v-model="model"/>
    <button id="sendButton" @click="onSendClicked">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
        <path
            fill="none"
            d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
        ></path>
        <path
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="33.67"
            stroke="#6c6c6c"
            d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
        ></path>
      </svg>
    </button>
  </div>

</template>
<style scoped>
.messageBox {
  width: 100%;
  min-height: 40px;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  padding: 0 15px;
  border-radius: 10px;
  border: 1px solid rgb(110, 110, 110);
}

.messageBox:focus-within {
  border: 1px solid rgb(63, 63, 63);
}

#messageInput {
  padding: 10px;
  width: 100%;
  scrollbar-width: none;
  background-color: transparent;
  outline: none;
  border: none;
  color: black;
  resize: none;

}

#messageInput:focus ~ #sendButton svg path,
#messageInput:valid ~ #sendButton svg path {
  fill: #f2f2f2;
  stroke: black;
}


#sendButton {
  width: fit-content;
  height: 100%;
  background-color: transparent;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

#sendButton svg {
  height: 18px;
  transition: all 0.3s;
}

#sendButton svg path {
  transition: all 0.3s;
}

#sendButton:hover svg path {
  fill: #f2f2f2;
  stroke: black;
}

</style>