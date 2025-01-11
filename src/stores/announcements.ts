import {defineStore} from "pinia";
import {ref} from "vue";
import type {CategorizedAnnouncements, Category} from "@/types/announcement/categories";
import type {Announcement} from "@/types/announcement/announcement";
import {categorizeAnnouncements} from "@/utils/announcement/announcementCategories";


// ユーザーidからそのユーザーのユーザー名, アイコン等を保持するストア。もしキャッシュがあればそこから返し, なければ都度取得するようにする.
export const useAnnouncementsStore = defineStore('announcements', () => {
    const categories = ref<Category[]>([]);
    const announcements = ref<Announcement[]>([]);
    const categorizedAnnouncements = ref<CategorizedAnnouncements>({});

    const updateAnnouncement = (announcement: Announcement) => {
        const index = announcements.value.findIndex(a => a.announceId === announcement.announceId);
        if (index === -1) {
            announcements.value.push(announcement);
        } else {
            announcements.value[index] = announcement;
        }
        categorize();
    }

    const deleteAnnouncement = (announceId: string) => {
        const index = announcements.value.findIndex(a => a.announceId === announceId);
        if (index !== -1) {
            announcements.value.splice(index, 1);
        }
        categorize();
    }

    const categorize = () => {
        categorizedAnnouncements.value = categorizeAnnouncements(categories.value, announcements.value)
    }

    return {
        categories,
        announcements,
        categorizedAnnouncements,
        updateAnnouncement,
        deleteAnnouncement,
        categorize
    }
});