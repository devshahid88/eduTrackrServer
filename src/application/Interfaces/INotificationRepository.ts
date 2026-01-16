import { Notification } from '../../domain/entities/Notification';
import { IBaseRepository } from './IBaseRepository';

export interface INotificationRepository extends IBaseRepository<Notification> {
  createNotification(notification: Partial<Notification>): Promise<Notification>;
  getNotifications(userId: string, userModel: 'Teacher' | 'Student' | 'Admin'): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<Notification>;
  markAllAsRead(userId: string, userModel: 'Teacher' | 'Student' | 'Admin'): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
}