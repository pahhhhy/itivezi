import {type DatabaseReference, get, update} from "firebase/database";
import {ref as fireRef} from "@firebase/database";
import type {Category, NestedAnnouncements} from "@/types/announcement/categories";
import type {Announcement} from "@/types/announcement/announcement";

export const getCategories = (db: DatabaseReference) => {
    const categoriesRef = fireRef(db, 'testAnnouncements/categories');
    return get(categoriesRef).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    }).catch((error) => {
        console.error('エラーが発生しました:', error)
    });
}

export const getCategoryName = (db: DatabaseReference, categoryId: string) => {
    const categoryRef = fireRef(db, `testAnnouncements/categories/${categoryId}/name`);
    return get(categoryRef).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    }).catch((error) => {
        console.error('エラーが発生しました:', error)
    });
}

export const addAnnouncementToCategory = (db: DatabaseReference, categoryId: string, announceId: string) => {
    const categoryRef = fireRef(db, `testAnnouncements/categories/${categoryId}/announces/${announceId}`);
    return update(categoryRef, true).catch((error) => {
        console.error('エラーが発生しました:', error)
    });
}

export const removeAnnouncementFromCategory = (db: DatabaseReference, categoryId: string, announceId: string) => {
    const categoryRef = fireRef(db, `testAnnouncements/categories/${categoryId}/announces/${announceId}`);
    return update(categoryRef, null).catch((error) => {
        console.error('エラーが発生しました:', error)
    });
}


export const reorganizeAnnouncements = (categories: Category[], announcements: Announcement[]): NestedAnnouncements => {
    const nestedAnnouncements: NestedAnnouncements = {
        "未分類": {}
    };
    setTimeout(() => {
        console.log("categories", categories);
    }, 2000);

    categories.forEach(category => {
        nestedAnnouncements[category.categoryName] = {};
        category.announcementIds.forEach(announceId => {
            const announcement = announcements.find(a => a.announceId === announceId);
            if (announcement) {
                nestedAnnouncements[category.categoryName][announceId] = announcement;
            } else {
                console.warn(`Announcement with ID ${announceId} not found.`);
            }
        });
    });

    // カテゴリーに属さないアナウンスメントを「未分類」に移動
    announcements.forEach(announcement => {
        if (!categories.some(category => category.announcementIds.includes(announcement.announceId))) {
            nestedAnnouncements["未分類"][announcement.announceId] = announcement;
        }
    });

    return nestedAnnouncements;
}