<script setup lang="ts">
import type {Category} from "@/types/announcement/categories";
import {onMounted, onUnmounted, ref} from "vue";
import CategoriesManager from "@/views/components/announcementPage/categoriesManager.vue";

interface Props {
  role: string
  categories: Category[]
}

interface Emits {
  (event: 'close'): void

  (event: 'select', category: Category): void
}

const {role, categories} = defineProps<Props>()
const emit = defineEmits<Emits>()

const wrapperClass = ref<string>('') // 開閉アニメーションに使う

const isEditing = ref<boolean>(false)
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
  const category = categories.find((category) => category.categoryId === categoryId)
  if (category) {
    emit('select', category)
    close()
  }
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

      <h3>カテゴリの選択</h3>
      <button
          v-if="role === '管理者'"
          @click="isEditing = !isEditing"
          class="edit-button"
          :disabled="isChanged"
      >
        <!--        編集アイコン-->
        <!--        編集モードでないとき-->
        <svg v-if="!isEditing" width="16" height="16" viewBox="0 0 16 16" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M15.502 1.94003C15.5954 2.03375 15.6479 2.16069 15.6479 2.29303C15.6479 2.42536 15.5954 2.5523 15.502 2.64603L14.459 3.69003L12.459 1.69003L13.502 0.646027C13.5957 0.552292 13.7229 0.499634 13.8555 0.499634C13.988 0.499634 14.1152 0.552292 14.209 0.646027L15.502 1.93903V1.94003ZM13.752 4.39603L11.752 2.39603L4.93896 9.21003C4.88392 9.26505 4.84249 9.33217 4.81796 9.40603L4.01296 11.82C3.99836 11.864 3.99629 11.9112 4.00697 11.9564C4.01766 12.0015 4.04068 12.0427 4.07347 12.0755C4.10625 12.1083 4.14751 12.1313 4.19263 12.142C4.23775 12.1527 4.28495 12.1506 4.32896 12.136L6.74296 11.331C6.81672 11.3068 6.88383 11.2657 6.93896 11.211L13.752 4.39603Z"
              fill="black"/>
          <path fill-rule="evenodd" clip-rule="evenodd"
                d="M1 13.5C1 13.8978 1.15804 14.2794 1.43934 14.5607C1.72064 14.842 2.10218 15 2.5 15H13.5C13.8978 15 14.2794 14.842 14.5607 14.5607C14.842 14.2794 15 13.8978 15 13.5V7.5C15 7.36739 14.9473 7.24021 14.8536 7.14645C14.7598 7.05268 14.6326 7 14.5 7C14.3674 7 14.2402 7.05268 14.1464 7.14645C14.0527 7.24021 14 7.36739 14 7.5V13.5C14 13.6326 13.9473 13.7598 13.8536 13.8536C13.7598 13.9473 13.6326 14 13.5 14H2.5C2.36739 14 2.24021 13.9473 2.14645 13.8536C2.05268 13.7598 2 13.6326 2 13.5V2.5C2 2.36739 2.05268 2.24021 2.14645 2.14645C2.24021 2.05268 2.36739 2 2.5 2H9C9.13261 2 9.25979 1.94732 9.35355 1.85355C9.44732 1.75979 9.5 1.63261 9.5 1.5C9.5 1.36739 9.44732 1.24021 9.35355 1.14645C9.25979 1.05268 9.13261 1 9 1H2.5C2.10218 1 1.72064 1.15804 1.43934 1.43934C1.15804 1.72064 1 2.10218 1 2.5V13.5Z"
                fill="black"/>
        </svg>
        <!--        編集モードのとき-->
        <svg v-else xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"
             :fill="isChanged ? 'gray' : 'black'"> <!--isChangedのときは灰色にする-->
          <path
              d="m339-288 141-141 141 141 51-51-141-141 141-141-51-51-141 141-141-141-51 51 141 141-141 141 51 51ZM480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/>
        </svg>
      </button>
    </div>
    <div class="content">
      <div class="categories" v-if="!isEditing">
        <button v-for="category in categories" :key="category.categoryId" @click="onSelect(category.categoryId)">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="000000">
            <path
                d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h171q8-31 33.5-51.5T480-888q34 0 59.5 20.5T573-816h171q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm0-72h528v-528H216v528Zm72-72h288v-72H288v72Zm0-156h384v-72H288v72Zm0-156h384v-72H288v72Zm192-168q10.4 0 17.2-6.8 6.8-6.8 6.8-17.2 0-10.4-6.8-17.2-6.8-6.8-17.2-6.8-10.4 0-17.2 6.8-6.8 6.8-6.8 17.2 0 10.4 6.8 17.2 6.8 6.8 17.2 6.8ZM216-216v-528 528Z"/>
          </svg>
          {{ category.categoryName }}
        </button>
      </div>
      <div v-else>
        <p style="text-align: center; margin-bottom: 4px;">編集モード</p>
        <CategoriesManager
            :categories="categories"
            @edit="isEditing = true"
            @isChanged="isChanged = $event"
        ></CategoriesManager>
      </div>
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

.categories {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  & > button {

    cursor: pointer;
    text-align: left;
    font-size: 1.1em;
    /* 太く */
    font-weight: bold;
  }
}
</style>