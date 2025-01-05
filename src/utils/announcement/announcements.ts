import {child, type DatabaseReference, get, push, remove, serverTimestamp, set, update} from 'firebase/database'
import type {Announcement, ServerTimestamp} from "@/types/announcement/announcement";

/**
 * 投稿を投稿します。権限の確認はここでは行いません。
 * @param announcementRootRef データを置く場所のリファレンス。
 * @param pushData 保存するデータ。
 * @returns 保存したデータのID
 */
export async function postAnnouncement(announcementRootRef: DatabaseReference, pushData: Omit<Announcement, "announceId">) {
    const announcementsRef = child(announcementRootRef, 'announcements');
    const newAnnounceRef = push(announcementsRef)
    const pushDataWithId = {...pushData, announceId: newAnnounceRef.key}
    // カテゴリの処理
    console.log(pushData.categoryId)
    if (pushData.categoryId && newAnnounceRef.key) {
        await addAnnouncementToCategory(announcementRootRef, pushData.categoryId, newAnnounceRef.key, pushData.createdAt)
    }

    set(newAnnounceRef, pushDataWithId)
        .catch((error) => {
            console.error('エラーが発生しました:', error)
        })
    return newAnnounceRef.key
}

/**
 * 投稿を削除します。権限の確認はここでは行いません。
 * @param announcementRootRef データを置く場所のリファレンス。
 * @param announcementRef 削除したい投稿そのもののリファレンス。
 * @param announceId 削除する投稿のID。
 * @param categoryId 属していたカテゴリのID。
 */
export async function deleteAnnouncement(announcementRootRef: DatabaseReference, announcementRef: DatabaseReference, announceId: string, categoryId: string) {
    if (categoryId) {
        await removeAnnouncementFromCategory(announcementRootRef, categoryId, announceId);
    }

    await remove(announcementRef);
}

/**
 * 投稿を更新します。権限の確認はここでは行いません。
 * @param announcementRef 更新したい投稿そのもののリファレンス。
 * @param updateData 更新するデータ。
 * @returns 更新したデータ(サーバータイムスタンプ付き)
 */
export async function updateAnnouncement(announcementRef: DatabaseReference, updateData: Partial<Announcement>) {
    updateData.updatedAt = serverTimestamp() as unknown as number;
    update(announcementRef, updateData)
        .catch((error) => {
            console.error('エラーが発生しました:', error)
        })
    return updateData;
}

/**
 * カテゴリに投稿を追加または削除します。
 * @param announcementRootRef データを置く場所のリファレンス。
 * @param categoryId カテゴリのID。
 * @param announceId 投稿のID。
 * @param action アクションタイプ ('add' または 'remove')。
 * @param createdAt (任意) 追加時の投稿の作成日時。ただし、削除時には無視されます。
 * @returns 更新した投稿のID。
 */
async function updateAnnouncementInCategory(
    announcementRootRef: DatabaseReference,
    categoryId: string,
    announceId: string,
    action: 'add' | 'remove',
    createdAt?: ServerTimestamp
) {

    const categoryRef = child(announcementRootRef, 'categories/' + categoryId);
    const categoryDataSnapshot = await get(categoryRef);
    console.log(categoryRef)
    if (!categoryDataSnapshot.exists()) {
        console.error(`Category with ID ${categoryId} does not exist.`);
        return;
    }

    const categoryData = categoryDataSnapshot.val();
    const announcementCount = categoryData.announcementCount ?? 0;
    const announces: Record<string, number> = categoryData.announces ?? {};

    if (action === 'add' && createdAt !== undefined) {
        announces[announceId] = createdAt as unknown as number;
    } else if (action === 'remove') {
        delete announces[announceId];
    } else {
        console.error('Invalid action or missing createdAt parameter for add action.');
        return;
    }

    // 更新内容を準備
    const updates = {
        announcementCount: action === 'add' ? announcementCount + 1 : announcementCount - 1,
        announces: announces
    };

    await update(categoryRef, updates).catch(error => {
        console.error('エラーが発生しました:', error);
    });

    return announceId;
}

/** 投稿のカテゴリを変更します。
 * カテゴリが変更されていない場合は何もしません。
 * @param announcementRootRef
 * @param announceId
 * @param oldCategoryId
 * @param newCategoryId
 * @param createdAt その投稿の作成日時。
 */
export async function changeAnnouncementCategory(
    announcementRootRef: DatabaseReference,
    announceId: string,
    oldCategoryId: string,
    newCategoryId: string,
    createdAt: ServerTimestamp
) {
    if (oldCategoryId === newCategoryId) {
        return;
    }

    // 判定を分けているのはカテゴリ消失によるID空文字等の状況を考慮のため
    if (oldCategoryId) {
        await removeAnnouncementFromCategory(announcementRootRef, oldCategoryId, announceId);
    }
    if (newCategoryId) {
        await addAnnouncementToCategory(announcementRootRef, newCategoryId, announceId, createdAt);
    }
}

/**
 * カテゴリに投稿を追加します。
 * @param announcementRootRef データを置く場所のリファレンス。
 * @param categoryId 追加するカテゴリのID。
 * @param announceId 追加する投稿のID。
 * @param createdAt 追加する投稿の作成日時。
 * @returns 追加したデータのID。
 */
export async function addAnnouncementToCategory(
    announcementRootRef: DatabaseReference,
    categoryId: string,
    announceId: string,
    createdAt: ServerTimestamp
) {
    return updateAnnouncementInCategory(announcementRootRef, categoryId, announceId, 'add', createdAt);
}

/**
 * カテゴリから投稿を削除します。
 * @param announcementRootRef データを置く場所のリファレンス。
 * @param categoryId 削除するカテゴリのID。
 * @param announceId 削除する投稿のID。
 * @returns 削除したデータのID。
 */
export async function removeAnnouncementFromCategory(
    announcementRootRef: DatabaseReference,
    categoryId: string,
    announceId: string
) {
    return updateAnnouncementInCategory(announcementRootRef, categoryId, announceId, 'remove');
}