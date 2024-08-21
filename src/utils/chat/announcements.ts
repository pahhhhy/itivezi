import {type DatabaseReference, push, set} from "firebase/database";
import type {Announcement} from "@/types/chatpage/announcement";


export function postAnnouncement(announcementsRef: DatabaseReference, pushData: Omit<Announcement, "announceId">) {
    const newAnnounceRef = push(announcementsRef)
    const pushDataWithId = {...pushData, announceId: newAnnounceRef.key}
    set(newAnnounceRef, pushDataWithId)
        .catch((error) => {
            console.error('注文の保存中にエラーが発生しました:', error)
        })
}