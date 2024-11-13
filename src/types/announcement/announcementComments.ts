import type {ServerTimestamp} from "@/types/announcement/announcement";

export interface AnnouncementCommentType {
    userId: string;
    commentId: string;
    content: string;
    createdAt: ServerTimestamp;
    updatedAt?: ServerTimestamp;
    replyTo?: string;
    replies?: {
        [string]: AnnouncementCommentType
    };
}

export interface AnnouncementCommentWithViewData extends AnnouncementCommentType {
    userName: string;
    userIconURL: string;
}