export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface UserNotification {
  id?: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read?: boolean;
  createdAt?: string;
  readAt?: string;
}

export interface NotificationFilters {
  userId?: number;
  read?: boolean;
  type?: NotificationType;
  from?: string;
  to?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}
