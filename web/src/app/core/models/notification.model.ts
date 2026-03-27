export interface AppNotification {
    id?: number;
    titre: string;
    message: string;
    type?: string;
    lu?: boolean;
    dateCreation?: string;
}
