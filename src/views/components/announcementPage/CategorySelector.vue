<script setup lang="ts">
import type {Category} from "@/types/announcement/categories";
import {onMounted, onUnmounted, ref} from "vue";
import CategoriesManager from "@/views/components/announcementPage/CategoriesManager.vue";
import {useAnnouncementsStore} from "@/stores/announcements";

interface Props {
  role: string
}

interface Emits {
  (event: 'close'): void

  (event: 'select', category: Category): void
}

const {role} = defineProps<Props>()
const emit = defineEmits<Emits>()

const announcementsStore = useAnnouncementsStore();

const wrapperClass = ref<string>('') // 開閉アニメーションに使う

const isEditing = ref<boolean>(false)
const isChanged = ref<boolean>(false)
const isDisableCloseButton = ref<boolean>(false)


onMounted(() => {
  document.body.style.overflow = 'hidden'

  setTimeout(() => {
    wrapperClass.value = 'enter-active'
  }, 1)
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
  const category = announcementsStore.categories.find((category) => category.categoryId === categoryId)
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
        <IconCross :color="isChanged ? 'gray' : 'black'"/>
      </button>

      <h3>カテゴリーの選択</h3>
      <button
          v-if="role === '管理者'"
          @click="isEditing = !isEditing"
          class="edit-button"
          :disabled="isChanged"
      >
        <!--        編集アイコン-->
        <!--        編集モードでないとき-->
        <IconEdit v-if="!isEditing" :fill="isChanged ? 'gray' : 'black'"/>
        <!--        編集モードのとき-->
        <IconCrossWithCircle v-else :fill="isChanged ? 'gray' : 'black'"/>
      </button>
    </div>
    <div class="content">
      <div class="categories" v-if="!isEditing && announcementsStore.categories.length > 0 && announcementsStore.categories[0].categoryId">
          <button v-for="category in announcementsStore.categories" :key="category.categoryId"
                  @click="onSelect(category.categoryId)">
            <IconClipboard color="black"/>
            {{ category.categoryName }}
          </button>

      </div>
      <div v-else-if="isEditing">
        <p style="text-align: center; margin-bottom: 4px;">編集モード</p>
        <CategoriesManager
            @edit="isEditing = true"
            @isChanged="isChanged = $event"
        ></CategoriesManager>
      </div>
      <div v-else>
        <p>カテゴリがありません</p>
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