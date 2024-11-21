import type {Announcement, ServerTimestamp} from "@/types/announcement/announcement";

export interface Category {
    categoryId: string;
    categoryName: string;
    announcementCount: number;
    announces: {
        [announceId: string]: ServerTimestamp;
    };
}

export interface CategorizedAnnouncements {
    [categoryName: string]: {
        [announceId: string]: Announcement;
    };
}