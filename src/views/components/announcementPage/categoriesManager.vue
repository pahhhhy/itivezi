<script setup lang="ts">

import {useAnnouncementCategories} from "@/utils/announcement/useAnnouncementCategoriesHook";
import type {Category} from "@/types/announcement/categories";
import {ref} from "vue";

interface Props {
  categories: Category[]
}

const {categories} = defineProps<Props>()

const {addCategory, deleteCategory, editCategoryName} = useAnnouncementCategories()
const categoryNameInput = ref<string>('')


</script>
<template>
  <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
    <h5>カテゴリ一覧(仮)</h5>
    <div style="border: 1px solid black; margin: 1rem; height: fit-content; width: fit-content;">
      <div v-for="category in categories" :key="category.categoryId">
        <p>{{ category.categoryName }}</p>
        <input type="text" v-model="category.categoryName">
        <button @click="editCategoryName(category.categoryId, category.categoryName)">改名</button>
        <button @click="deleteCategory(category.categoryId)">削除</button>
      </div>
    </div>
    <div>
      <p>カテゴリ新規作成</p>
      <input v-model="categoryNameInput" type="text" placeholder="カテゴリ名を入力">
      <button @click="addCategory(categoryNameInput)">作成</button>
    </div>
  </div>
</template>
<style scoped>
</style>