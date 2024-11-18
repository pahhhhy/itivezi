import {type DatabaseReference, push, remove, serverTimestamp, set, update} from "firebase/database";
import type {Announcement} from "@/types/announcement/announcement";

/**
 * お知らせを投稿します。権限の確認はここでは行いません。
 * @param announcementsRef データを置く場所のリファレンス。
 * @param pushData 保存するデータ。
 * @returns 保存したデータのID
 */
export function postAnnouncement(announcementsRef: DatabaseReference, pushData: Omit<Announcement, "announceId">) {
    const newAnnounceRef = push(announcementsRef)
    const pushDataWithId = {...pushData, announceId: newAnnounceRef.key}
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
export function deleteAnnouncement(announcementRef: DatabaseReference) {
    remove(announcementRef);
}

/**
 * お知らせを更新します。権限の確認はここでは行いません。
 * @param announcementRef 更新したいお知らせそのもののリファレンス。
 * @param updateData 更新するデータ。
 * @returns 更新したデータ(サーバータイムスタンプ付き)
 */
export function updateAnnouncement(announcementRef: DatabaseReference, updateData: Partial<Announcement>) {
    updateData.updatedAt = serverTimestamp()
    update(announcementRef, updateData)
        .catch((error) => {
            console.error('エラーが発生しました:', error)
        })
    return updateData;
}

