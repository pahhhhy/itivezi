import type {ServerTimestamp} from "@/types/announcement/announcement";

export interface ChatRoom {
    roomId: string;
    roomName: string | null;
    users: Record<string, boolean>;
    createdAt: ServerTimestamp;
    lastMessage?: ChatMessage;
    lastUpdateAt?: ServerTimestamp;
    lastReadAt: Record<string, ServerTimestamp>; // userIdをキーにして最後に表示されたメッセージのtimestampを保持
}

export interface ChatRoomWithUnreadCount extends ChatRoom {
    unreadCount: number;
}

export interface ChatFile {
    fileId: string;
    messageId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    createdAt: ServerTimestamp;
}

export interface ChatUser {
    rooms: Record<string, boolean>;
}

export interface ChatMessage {
    messageId: string;
    roomId: string;
    senderUid: string;
    message: string;
    attachedFiles?: {[fileId: string]: ChatFile};
    createdAt: ServerTimestamp;
    updatedAt?: ServerTimestamp;
    undo?: boolean;
}
