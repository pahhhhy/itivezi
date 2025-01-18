<script setup lang="ts">

import {useAnnouncementCategories} from "@/utils/announcement/useAnnouncementCategoriesHook";
import type {Category} from "@/types/announcement/categories";
import {ref} from "vue";
import {useAnnouncementsStore} from "@/stores/announcements";


interface Emits {
  (event: 'isChanged', value: boolean): void //   未保存の編集があるかどうか

}

const emit = defineEmits<Emits>()
const announcementsStore = useAnnouncementsStore();

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

  editingCategoryOriginal.value = announcementsStore.categories.find((category) => category.categoryId === categoryId) ?? null
  categoryNameInputText.value = announcementsStore.categories.find((category) => category.categoryId === categoryId)?.categoryName ?? ''
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

const onDeleteCategory = (categoryId: string) => {
  if (window.confirm(getCategoryNameById(categoryId) + 'を削除しますか？'))
    deleteCategory(categoryId)
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
  } else {
    editCategoryName(editingCategoryOriginal.value?.categoryId ?? '', categoryNameInputText.value)
  }

  isChanged.value = false
  emit('isChanged', false)
  editingCategoryOriginal.value = null
  categoryNameInputText.value = ''
  isEditingNewCategory.value = false
}

const getCategoryNameById = (categoryId: string) => {
  return announcementsStore.categories.find((category) => category.categoryId === categoryId)?.categoryName ?? ''
}
</script>
<template>
  <div class="categories-manager">
    <div class="categories">
      <div v-if="announcementsStore.categories.length > 0 && announcementsStore.categories[0].categoryId"> <!-- 何もカテゴリがない状態では「未分類」という、idが""の内部用カテゴリがある -->
        <div v-for="category in announcementsStore.categories" :key="category.categoryId">
          <button v-if="category.categoryId !== editingCategoryOriginal?.categoryId"
                  @click="onSelect(category.categoryId)"
                  :disabled="isChanged"
          >
            <IconPen/>
            {{ category.categoryName }}
          </button>
          <div v-else class="editing-category">
            <div>
              <IconPen/>
            </div>
            <input type="text" v-model="categoryNameInputText" @input="onInput" ref="categoryNameInputRef">
            <button @click="onDeleteCategory(editingCategoryOriginal?.categoryId)">
              <IconDelete/>
            </button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>カテゴリがありません</p>
      </div>
      <div style="margin-top: 16px;" v-if="isEditingNewCategory || !isChanged">
        <button @click="addNewCategory" v-if="!isEditingNewCategory">
          <IconAdd/>
          新規作成
        </button>
        <div v-else>
          <IconAdd/>
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
          <IconReturn/>
          <span>キャンセル</span>
        </button>
        <button
            @click="saveEdit"
        >
          <IconSave/>
          <span>保存</span>
        </button>

      </div>
      <span style="text-align: center; color: gray;">変更を反映するにはページの再読み込みが必要な場合があります。</span>

    </div>
  </div>
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
  height: fit-content;
  width: 100%;
  padding-left: 6px;
  display: flex;
  align-items: center;

  & > div, & > button {
    margin-right: 8px;
    flex-grow: 0;
    width: fit-content;

  }

  & input {
    flex-grow: 1;
    width: 100%;

  }
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