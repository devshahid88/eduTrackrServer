import { INotification } from '../../infrastructure/models/notification.models';

export interface INotificationRepository {
  createNotification(notification: Partial<INotification>): Promise<INotification>;
  getNotifications(userId: string, userModel: 'Teacher' | 'Student'): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<INotification>;
  markAllAsRead(userId: string, userModel: 'Teacher' | 'Student'): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
} 