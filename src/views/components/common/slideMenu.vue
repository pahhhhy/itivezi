<script setup lang="ts">
import type {Category} from "@/types/announcement/categories";
import {onMounted, onUnmounted, ref} from "vue";
import CategoriesManager from "@/views/components/announcementPage/categoriesManager.vue";

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

const isChanged = ref<boolean>(false)


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
</script>

<template>
  <div :class="['wrapper', wrapperClass]">
    <div class="top-bar">

      <button
        @click="close"
        class="close-button"
        :disabled="isChanged"
      >
        <!--        閉じるアイコン-->

        <svg width="19" height="18" viewBox="0 0 19 18" xmlns="http://www.w3.org/2000/svg" fill="none">
          <line x1="1.35355" y1="0.646447" x2="17.8597" y2="17.1525" :stroke="isChanged ? 'gray' : '#000'"/>
          <line x1="0.646447" y1="17.1526" x2="17.1525" y2="0.646453" :stroke="isChanged ? 'gray' : '#000'"/>
        </svg>
      </button>
      <h3>{{title}}</h3>
      <slot name="header-button">

      </slot>


    </div>

    <div class="content">
      <slot>

      </slot>
    </div>
  </div>

</template>

<style scoped>
button {
  border: none;
  background: none;
}

.wrapper {
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
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px;
  border-bottom: 1px solid var(--text-color);
  margin-bottom: 8px;

  /* 真ん中の要素 */

  & > *:nth-child(2) {
    margin: 0 auto;
    text-align: center;
  }
}

.content {
  overflow-y: auto;
}

</style>