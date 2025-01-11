import type {CategorizedAnnouncements, Category} from '@/types/announcement/categories'
import type {Announcement} from '@/types/announcement/announcement'

// カテゴリをキーとして、そのカテゴリに属する投稿を格納するオブジェクトを返す
export const categorizeAnnouncements = (
    categories: Category[],
    announcements: Announcement[]
): CategorizedAnnouncements => {

    // カテゴリ分けされた後のannouncementsを格納するオブジェクト
    const categorizedAnnouncements: CategorizedAnnouncements = {
        '未分類': {} // 初期で未分類用の枠を追加しておく
    }

    const categoryIdAndName = categories.map((category) => {
        return {categoryId: category.categoryId, categoryName: category.categoryName}
    })


    // 投稿一つ一つについて
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
            categorizedAnnouncements['未分類'][announcement.announceId] = announcement // 未分類に追加
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
