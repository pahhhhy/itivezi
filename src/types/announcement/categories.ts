import type {Announcement} from "@/types/announcement/announcement";

export interface Category {
    categoryId: string;
    categoryName: string;
    announcementCount: number;
    announces: {
        [announceId: string]: boolean;
    };
}

export interface CategorizedAnnouncements {
    [categoryName: string]: {
        [announceId: string]: Announcement;
    };
}