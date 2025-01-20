import {child, getDatabase, push, ref as fireRef, set, update} from "firebase/database";
import type {Category} from "@/types/announcement/categories";


export const useAnnouncementCategories = () => {
    const db = getDatabase();
    const categoriesRef = fireRef(db, 'Announcements/categories');

    const addCategory = (categoryName: string) => {
        const newCategoryRef = push(categoriesRef)
        const newCategoryId = newCategoryRef.key;
        if (!newCategoryId) { // もし既存のカテゴリなかったら
            throw new Error('Failed to push new category')
        }

        const categoryData: Category = {
            categoryName: categoryName,
            categoryId: newCategoryId,
            announces: {},
            announcementCount: 0,
        }

        set(newCategoryRef, categoryData).catch((error) => {
            console.error('エラーが発生しました:', error)
        })
        return newCategoryId
    }

    const editCategoryName = (categoryId: string, newName: string) => {
        const categoryRef = child(categoriesRef, categoryId)
        return update(categoryRef, {categoryName: newName})
    }

    const deleteCategory = (categoryId: string) => {
        const categoryRef = child(categoriesRef, categoryId)
        return set(categoryRef, null)
    }

    return {addCategory, editCategoryName, deleteCategory}

}
