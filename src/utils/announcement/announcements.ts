import {child, type DatabaseReference, get, push, remove, serverTimestamp, set, update} from 'firebase/database'
import type {Announcement, ServerTimestamp} from "@/types/announcement/announcement";

/**
 * お知らせを投稿します。権限の確認はここでは行いません。
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
 * お知らせを削除します。権限の確認はここでは行いません。
 * @param announcementRef 削除したいお知らせそのもののリファレンス。
 */
export async function deleteAnnouncement(announcementRef: DatabaseReference) {
    await remove(announcementRef);
}

/**
 * お知らせを更新します。権限の確認はここでは行いません。
 * @param announcementRef 更新したいお知らせそのもののリファレンス。
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
 * カテゴリに記事を追加または削除します。
 * @param announcementsRef データを置く場所のリファレンス。
 * @param categoryId カテゴリのID。
 * @param announceId 記事のID。
 * @param action アクションタイプ ('add' または 'remove')。
 * @param createdAt (任意) 追加時の記事の作成日時。ただし、削除時には無視されます。
 * @returns 更新した記事のID。
 */
async function updateAnnouncementInCategory(
    announcementsRef: DatabaseReference,
    categoryId: string,
    announceId: string,
    action: 'add' | 'remove',
    createdAt?: ServerTimestamp
) {

    const categoryRef = child(announcementsRef, 'categories/' + categoryId);
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

/**
 * カテゴリに記事を追加します。
 * @param announcementsRef データを置く場所のリファレンス。
 * @param categoryId 追加するカテゴリのID。
 * @param announceId 追加する記事のID。
 * @param createdAt 追加する記事の作成日時。
 * @returns 追加したデータのID。
 */
export async function addAnnouncementToCategory(
    announcementsRef: DatabaseReference,
    categoryId: string,
    announceId: string,
    createdAt: ServerTimestamp
) {
    return updateAnnouncementInCategory(announcementsRef, categoryId, announceId, 'add', createdAt);
}

/**
 * カテゴリから記事を削除します。
 * @param announcementsRef データを置く場所のリファレンス。
 * @param categoryId 削除するカテゴリのID。
 * @param announceId 削除する記事のID。
 * @returns 削除したデータのID。
 */
export async function removeAnnouncementFromCategory(
    announcementsRef: DatabaseReference,
    categoryId: string,
    announceId: string
) {
    return updateAnnouncementInCategory(announcementsRef, categoryId, announceId, 'remove');
}