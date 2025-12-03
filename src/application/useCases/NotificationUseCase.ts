import { INotificationRepository } from '../Interfaces/INotificationRepository';
import { INotification } from '../../infrastructure/models/notification.models';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { NotificationMessage } from '../../common/enums/http-message.enum';

export class NotificationUseCase {
  constructor(private notificationRepository: INotificationRepository) {}

  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    try {
      return await this.notificationRepository.createNotification(notification);
    } catch (error) {
      console.error('Error in createNotification:', error);
      createHttpError(NotificationMessage.CREATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getNotifications(userId: string, userModel: 'Teacher' | 'Student'): Promise<INotification[]> {
    try {
      return await this.notificationRepository.getNotifications(userId, userModel);
    } catch (error) {
      console.error('Error in getNotifications:', error);
      createHttpError(NotificationMessage.FETCH_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markAsRead(notificationId: string): Promise<INotification> {
    try {
      return await this.notificationRepository.markAsRead(notificationId);
    } catch (error) {
      console.error('Error in markAsRead:', error);
      createHttpError(NotificationMessage.MARK_READ_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markAllAsRead(userId: string, userModel: 'Teacher' | 'Student'): Promise<void> {
    try {
      await this.notificationRepository.markAllAsRead(userId, userModel);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      createHttpError(NotificationMessage.MARK_ALL_READ_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await this.notificationRepository.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      createHttpError(NotificationMessage.DELETE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
