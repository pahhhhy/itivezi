import type {ServerTimestamp} from "@/types/announcement/announcement";

export interface AnnouncementComment {
    userId: string;
    commentId: string;
    content: string;
    createdAt: ServerTimestamp;
    updatedAt?: ServerTimestamp;
    replyTo?: string;
    replies?: {
        [string]: AnnouncementComment
    };
}

export interface AnnouncementCommentWithViewData extends AnnouncementComment {
    userName: string;
    userIconURL: string;
}