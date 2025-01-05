<script lang="ts" setup>


import type {ChatMessage} from "@/types/chat/chat";
import {inject, onMounted, onUnmounted, ref} from "vue";
import {useChatMessageHook} from "@/utils/chat/useChatMessageHook";
import type {User} from "firebase/auth";

const {message} = defineProps<{
  message: ChatMessage
}>()
const emit = defineEmits<{
  (event: 'close'): void
}>()

const user = inject<User>('user')!
const roomId = inject<string>('roomId')!

const {undoMessage} = useChatMessageHook(roomId, user)
const contextMenuRef = ref<HTMLElement | null>(null)

const onClick = (e: any) => {
  if (e.target.closest('.context-menu')) return // コンテキストメニュー内をクリックしたときは何もしない
  emit('close')
}


onMounted(() => {
  // 他の場所をクリックされたときの挙動
  document.addEventListener('click', onClick)

})

onUnmounted(() => {
  document.removeEventListener('click', onClick)
})


</script>
<template>
  <div class="context-menu" ref="contextMenuRef">
    <div class="context-menu-button">
      <button @click="undoMessage(message)">
        <IconDelete/>
        <span>削除</span>
      </button>
    </div>
  </div>
</template>
<style scoped>
.context-menu {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: calc(100% + 5px);
  right: 10px; /* 現状自分のメッセージにしか表示されないので右寄せ */
  z-index: 100;
  border-radius: 5px;
  height: 64px;
  width: 64px;

  background: var(--background-color);
  /*ちょっと暗くする*/
  filter: brightness(0.9);

  button {
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    p {
      margin: 0;
      display: block;
    }
  }


}

</style>