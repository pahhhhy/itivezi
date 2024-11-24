<script setup lang="ts">

import {useAnnouncementCategories} from "@/utils/announcement/useAnnouncementCategoriesHook";
import type {Category} from "@/types/announcement/categories";
import {ref} from "vue";

interface Props {
  categories: Category[]
}

interface Emits {
  (event: 'isChanged', value: boolean): void //   未保存の編集があるかどうか

}

const {categories} = defineProps<Props>()
const emit = defineEmits<Emits>()


const {addCategory, deleteCategory, editCategoryName} = useAnnouncementCategories()

const isChanged = ref<boolean>(false)
const categoryNameInputRef = ref<HTMLInputElement | null>(null)
const categoryNameInputText = ref<string>('')
const editingCategoryOriginal = ref<Category | null>(null)
const isEditingNewCategory = ref<boolean>(false)
const newCategoryName = ref<string | null>(null)

const onSelect = (categoryId: string) => {
  if (isChanged.value) {
    // editCategoryName(editingCategoryId.value, categoryNameInputText.value)
    editCategoryName(editingCategoryOriginal.value?.categoryId ?? '', categoryNameInputText.value)
    isChanged.value = false
  }
  isEditingNewCategory.value = false

  editingCategoryOriginal.value = categories.find((category) => category.categoryId === categoryId) ?? null
  categoryNameInputText.value = categories.find((category) => category.categoryId === categoryId)?.categoryName ?? ''
  new Promise<void>((resolve) => {
    setTimeout(() => {
      const inputArr = categoryNameInputRef.value
      if (inputArr) {
        if (inputArr instanceof Array) {
          inputArr[0].focus()
        }
      }
      resolve()
    }, 1)
  })
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  categoryNameInputText.value = target.value

//   もとのカテゴリ名と変更後のカテゴリ名が異なる場合、かつその検証結果がisChangedと異なる場合
  const isChangedBool = editingCategoryOriginal.value?.categoryName !== categoryNameInputText.value
  if (isChanged.value !== isChangedBool) {
    isChanged.value = isChangedBool
    emit('isChanged', isChangedBool)
  }
}

// 新規カテゴリ作成モードに入る
const addNewCategory = () => {
  editingCategoryOriginal.value = {  // ダミー
    categoryId: '',
    categoryName: '(新規作成)',
    announcementCount: 0,
    announces: {}
  }
  newCategoryName.value = ''
  isEditingNewCategory.value = true
  isChanged.value = true
  emit('isChanged', true)
}

// 新規カテゴリ作成を確定する
const commitNewCategory = () => {
  addCategory(newCategoryName.value ?? '')
  newCategoryName.value = null
}

const cancelEdit = () => {
  isChanged.value = false
  emit('isChanged', false)
  editingCategoryOriginal.value = null
  categoryNameInputText.value = ''
  isEditingNewCategory.value = false
}

const saveEdit = () => {
  if (isEditingNewCategory.value) {
    commitNewCategory()
  }else {
    editCategoryName(editingCategoryOriginal.value?.categoryId ?? '', categoryNameInputText.value)
  }

  isChanged.value = false
  emit('isChanged', false)
  editingCategoryOriginal.value = null
  categoryNameInputText.value = ''
  isEditingNewCategory.value = false
}

</script>
<template>
  <div class="categories-manager">
    <div class="categories">
      <!--      カテゴリの編集機能やっているところ 次: UIをカテゴリ選択に合わせて、改名と削除機能をつける-->
      <div v-for="category in categories" :key="category.categoryId">
        <button v-if="category.categoryId !== editingCategoryOriginal?.categoryId"
                @click="onSelect(category.categoryId)"
                :disabled="isChanged"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="000000">
            <path
                d="M216-216h51l375-375-51-51-375 375v51Zm-72 72v-153l498-498q11-11 23.84-16 12.83-5 27-5 14.16 0 27.16 5t24 16l51 51q11 11 16 24t5 26.54q0 14.45-5.02 27.54T795-642L297-144H144Zm600-549-51-51 51 51Zm-127.95 76.95L591-642l51 51-25.95-25.05Z"/>
          </svg>
          {{ category.categoryName }}
        </button>
        <div v-else class="editing-category">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="000000">
            <path
                d="M216-216h51l375-375-51-51-375 375v51Zm-72 72v-153l498-498q11-11 23.84-16 12.83-5 27-5 14.16 0 27.16 5t24 16l51 51q11 11 16 24t5 26.54q0 14.45-5.02 27.54T795-642L297-144H144Zm600-549-51-51 51 51Zm-127.95 76.95L591-642l51 51-25.95-25.05Z"/>
          </svg>
          <input type="text" v-model="categoryNameInputText" @input="onInput" ref="categoryNameInputRef">
        </div>
      </div>
      <div style="margin-top: 16px;" v-if="isEditingNewCategory || !isChanged">
        <button @click="addNewCategory" v-if="!isEditingNewCategory">
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="000000"><path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z"/></svg>
          新規作成
        </button>
        <div v-else>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="000000"><path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z"/></svg>
          <input type="text" v-model="newCategoryName" @input="onInput">
        </div>
      </div>
    </div>

    <div v-if="isChanged" class="edit-controls">
      <div class="edit-log">
        <p>{{ editingCategoryOriginal?.categoryName }}</p>
        <p>→</p>
        <p>{{ categoryNameInputText }}</p>
      </div>
      <div>
        <button
            @click="cancelEdit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="000000">
            <path
                d="M288-192v-72h288q50 0 85-35t35-85q0-50-35-85t-85-35H330l93 93-51 51-180-180 180-180 51 51-93 93h246q80 0 136 56t56 136q0 80-56 136t-136 56H288Z"/>
          </svg>
          <span>キャンセル</span>
        </button>
        <button
            @click="saveEdit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="000000">
            <path
                d="M816-672v456q0 29.7-21.15 50.85Q773.7-144 744-144H216q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h456l144 144Zm-72 30L642-744H216v528h528v-426ZM480-252q45 0 76.5-31.5T588-360q0-45-31.5-76.5T480-468q-45 0-76.5 31.5T372-360q0 45 31.5 76.5T480-252ZM264-552h336v-144H264v144Zm-48-77v413-528 115Z"/>
          </svg>
          <span>保存</span>
        </button>

      </div>
      <span style="text-align: center; color: lightgray;">カテゴリの変更を反映するには、再読み込みが必要な場合がございます。</span>

    </div>
  </div>

  <!--  <div>-->
  <!--    <p>カテゴリ新規作成</p>-->
  <!--    <input v-model="categoryNameInputText" type="text" placeholder="カテゴリ名を入力">-->
  <!--    <button @click="addCategory(categoryNameInputText)">作成</button>-->
  <!--  </div>-->
</template>
<style scoped>
button {
  box-sizing: border-box;
  border: none;
  background-color: transparent;
}

.categories-manager {
  padding: 0 16px;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  & button, & input {
    cursor: pointer;
    text-align: left;
    font-size: 1.1em;
    /* 太く */
    font-weight: bold;
  }

  & button {
    width: 100%;
  }

  & input {
    width: calc(100% - 24px);
    padding-left: 4px;
    border: none;
    border-bottom: 1px solid var(--text-color);
  }
}

.editing-category {
  padding-left: 6px;
}

.edit-controls {
  /* 画面下部に固定 */
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: 1px solid var(--text-color);
  padding: 16px 0 48px;
  display: flex;
  flex-direction: column;

  & > div {
    display: flex;
    justify-content: space-around;

    & button {
      margin: 0 8px;
      width: calc(6em + 12px);
      display: inline-flex;
      border: 1px solid var(--text-color);
      align-items: center;

      & span {
        margin: 0 auto;
      }

    }
  }

}

.edit-log {
  /* 常に端で改行 */
  overflow-wrap: break-word;
  word-break: break-all;

  & > p:not(:nth-child(2)) {
    width: 100%;
    height: fit-content;
    text-align: center;
    margin: 0 4px;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.1);

  }
}
</style>