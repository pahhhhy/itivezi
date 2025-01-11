<script setup lang="ts">
import type {Category} from "@/types/announcement/categories";
import {onMounted, onUnmounted, ref} from "vue";

interface Props {
  title: string
}

interface Emits {
  (event: 'close'): void

  (event: 'select', category: Category): void
}

const {title} = defineProps<Props>();
const emit = defineEmits<Emits>();

const wrapperClass = ref<string>('') // 開閉アニメーションに使う

const isDisableCloseButton = ref<boolean>(false);


onMounted(() => {
  document.body.style.overflow = 'hidden'

  new Promise<void>((resolve) => {
    setTimeout(() => {
      wrapperClass.value = 'enter-active'
      resolve()
    }, 0)
  })

})

onUnmounted(() => {
  document.body.style.overflow = ''

})

const close = () => {
  wrapperClass.value = 'leave-active'
  setTimeout(() => {
    emit('close')
  }, 200) // transitionの時間と合わせる
}

const onSelect = async (categoryId: string) => {

}

// refを介して外部からcloseを参照できるようにする
defineExpose({
  close
})
</script>

<template>
  <div :class="['slide-wrapper', wrapperClass]">
    <div class="top-bar">

      <button
          @click="close"
          class="close-button"
          :disabled="isDisableCloseButton"
      >
        <!--        閉じるアイコン-->
        <IconCross :color="isDisableCloseButton? 'gray' : 'black'"/>

      </button>
      <h3>{{ title }}</h3>
      <div v-if="$slots['header-button']">
        <slot name="header-button" class="header-button">
        </slot>
      </div>


    </div>

    <div class="content">
      <slot @close="close">

      </slot>
    </div>
  </div>
</template>

<style scoped>
button {
  border: none;
  background: none;
}

.slide-wrapper {
  position: fixed;
  height: 100vh;
  width: 100vw;
  padding: calc(80px + 20px) 30px 0; /* headerの分 + 余白 */
  z-index: 2;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: start;
  background: var(--background-color);


  /* 左側にだけshadow */
  box-shadow: -5px 80px 1px rgba(0, 0, 0, 0.2);

  left: 100%;
  transition: left 0.2s ease-out;

  &.enter-active {
    left: 0;
  }

  &.leave-active {
    left: 100%;
  }
}

.top-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  padding: 8px;
  border-bottom: 1px solid var(--text-color);
  margin-bottom: 8px;

  & > *:first-child { /* 左端の要素 */
    margin-right: auto;
  }

  & > *:nth-child(2) { /* 中央の要素 */
    margin: 0;
  }

  & > *:nth-child(3) { /* 右端の要素 */
    margin-left: auto;
  }
}

.content {
  margin-bottom: 16px;
  overflow-x: hidden;
  overflow-y: scroll;

  scrollbar-width: none;
  -ms-overflow-style: none;

}

</style>