import type {AnnouncementCommentType} from "@/types/announcement/announcementComments";

export interface Announcement {
    announceId: string;
    title: string;
    content: string;
    createdAt: ServerTimestamp;
    updatedAt?: ServerTimestamp;
    userId: string;
    categoryId: string;
    comments: AnnouncementCommentType[];
}

export type ServerTimestamp = object | number; // set時にはserverTimestamp()を使用のこと。firebaseに送る前はobject, 取得したものはnumber型になっている。


export type MavonEditorToolbars = {
    bold: boolean,
    italic: boolean,
    header: boolean,
    underline: boolean,
    strikethrough: boolean,
    mark: boolean,
    superscript: boolean,
    subscript: boolean,
    quote: boolean,
    ol: boolean,
    ul: boolean,
    link: boolean,
    imagelink: boolean,
    code: boolean,
    table: boolean,
    fullscreen: boolean,
    readmodel: boolean,
    htmlcode: boolean,
    help: boolean,
    /* 1.3.5 */
    undo: boolean,
    redo: boolean,
    trash: boolean,
    save: boolean,
    /* 1.4.2 */
    navigation: boolean,
    /* 2.1.8 */
    alignleft: boolean,
    aligncenter: boolean,
    alignright: boolean,
    /* 2.2.1 */
    subfield: boolean,
    preview: boolean
}