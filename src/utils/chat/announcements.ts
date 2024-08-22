import {type DatabaseReference, push, remove, set, ref as fireRef, update, serverTimestamp} from "firebase/database";
import type {Announcement} from "@/types/chatpage/announcement";

/**
 * お知らせを投稿します。権限の確認はここでは行いません。
 * @param announcementsRef データを置く場所のリファレンス。
 * @param pushData 保存するデータ。
 * @returns 保存したデータのID
 */
export function postAnnouncement(announcementsRef: DatabaseReference, pushData: Omit<Announcement, "announceId">) {
    // fireRefの取得はvueコンポーネント内でないとできないので引数に取っています
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
 * @param announcementsRef 削除したいお知らせそのもののリファレンス。
 */
export function deleteAnnouncement(announcementRef: DatabaseReference) {
    // 現状はremoveを実行するだけですが、後ほど削除時の処理を拡張する可能性があるため関数分けをしています。
    remove(announcementRef);
}

/**
 * お知らせを更新します。権限の確認はここでは行いません。
 * @param announcementRef 更新したいお知らせそのもののリファレンス。
 * @param updateData 更新するデータ。
 */
export function updateAnnouncement(announcementRef: DatabaseReference, updateData: Partial<Announcement>) {
    updateData.updatedAt = serverTimestamp()
    update(announcementRef, updateData)
        .catch((error) => {
            console.error('エラーが発生しました:', error)
        })

}

