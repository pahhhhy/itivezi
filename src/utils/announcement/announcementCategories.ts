import { Database, get, ref as fireRef, set, update } from '@firebase/database'
import type { CategorizedAnnouncements, Category } from '@/types/announcement/categories'
import type { Announcement } from '@/types/announcement/announcement'
import { child } from 'firebase/database'

export const getCategories = async (db: Database) => {
  const categoriesRef = fireRef(db, 'testAnnouncements/categories')
  return get(categoriesRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val()
      } else {
        return null
      }
    })
    .catch((error) => {
      console.error('エラーが発生しました:', error)
    })
}

export const getCategoryName = async (db: Database, categoryId: string) => {
  const categoryRef = fireRef(db, `testAnnouncements/categories/${categoryId}/name`)
  return get(categoryRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val()
      } else {
        return null
      }
    })
    .catch((error) => {
      console.error('エラーが発生しました:', error)
    })
}

export const addAnnouncementToCategory = async (
  db: Database,
  categoryId: string,
  announceId: string
) => {
  const categoryRef = fireRef(db, `testAnnouncements/categories/${categoryId}`)
  const categorySnapshot = await get(categoryRef)
  if (!categorySnapshot.exists()) {
    console.error(`Category with ID ${categoryId} not found.`)
    return
  }
  const categoryData = categorySnapshot.val()
  if (!categoryData.announcementCount) {
    console.error(`Category with ID ${categoryId} does not have announcementCount.`)
    return
  }

  const newAnnouncementCount = categoryData.announcementCount + 1
  await update(categoryRef, { announcementCount: newAnnouncementCount })

  // そのカテゴリのannouncesに追加
  const announcesRef = child(categoryRef, 'announces')
  return set(announcesRef, { [announceId]: true }).catch((error) => {
    console.error('エラーが発生しました:', error)
  })
}

export const removeAnnouncementFromCategory = async (
  db: Database,
  categoryId: string,
  announceId: string
) => {
  const categoryRef = fireRef(db, `testAnnouncements/categories/${categoryId}`);
  const categorySnapshot = await get(categoryRef);
  if (!categorySnapshot.exists()) {
    console.error(`Category with ID ${categoryId} not found.`);
    return;
  }
  const categoryData = categorySnapshot.val();
  if (!categoryData.announcementCount) {
    console.error(`Category with ID ${categoryId} does not have announcementCount.`);
    return;
  }

  const newAnnouncementCount = categoryData.announcementCount - 1;
  await update(categoryRef, { announcementCount: newAnnouncementCount });

  // そのカテゴリのannouncesから削除
  const announcesRef = child(categoryRef, 'announces');
  return update(announcesRef, { [announceId]: null }).catch((error) => {
    console.error('エラーが発生しました:', error);
  });
}

// カテゴリをキーとして、そのカテゴリに属する記事を格納するオブジェクトを返す
export const categorizeAnnouncements = (
  categories: Category[],
  announcements: Announcement[]
): CategorizedAnnouncements => {

  // カテゴリ分けされた後のannouncementsを格納するオブジェクト
  const categorizedAnnouncements: CategorizedAnnouncements = {
    '': {} // 初期で未分類用の枠を追加しておく
  }

  const categoryIdAndName = categories.map((category) => {
    return { categoryId: category.categoryId, categoryName: category.categoryName }
  })


  // 記事一つ一つについて
  if (!announcements) {
    return categorizedAnnouncements;
  }
  if (announcements.length === 0) {
    return categorizedAnnouncements;
  }
  announcements.forEach((announcement) => {
    // 処理中のannouncementが属するカテゴリを取得
    const category = categoryIdAndName.find((category) => {
      return category.categoryId === announcement.categoryId;
    })
    if (!category) {
      // 所属しているカテゴリが見つからなかった場合
      categorizedAnnouncements[''][announcement.announceId] = announcement // 未分類に追加
    } else {
      // 所属しているカテゴリが見つかった場合
      if (!categorizedAnnouncements[category.categoryName]) {
        // もしまだそのカテゴリに分類されているものがなかったら
        categorizedAnnouncements[category.categoryName] = {} // そのカテゴリを追加してから
      }
      categorizedAnnouncements[category.categoryName][announcement.announceId] = announcement // そのカテゴリに追加
    }
  })

  return categorizedAnnouncements
}
