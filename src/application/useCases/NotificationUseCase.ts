import { INotificationRepository } from '../Interfaces/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { NotificationMessage } from '../../common/enums/http-message.enum';

import { ILogger } from '../Interfaces/ILogger';

export class NotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private logger: ILogger
  ) {}

  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    try {
      return await this.notificationRepository.createNotification(notification);
    } catch (error) {
      this.logger.error('Error in createNotification:', error);
      throw createHttpError(NotificationMessage.CREATE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getNotifications(userId: string, userModel: 'Teacher' | 'Student' | 'Admin'): Promise<Notification[]> {
    try {
      return await this.notificationRepository.getNotifications(userId, userModel);
    } catch (error) {
      this.logger.error('Error in getNotifications:', error);
      throw createHttpError(NotificationMessage.FETCH_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      return await this.notificationRepository.markAsRead(notificationId);
    } catch (error) {
      this.logger.error('Error in markAsRead:', error);
      throw createHttpError(NotificationMessage.MARK_READ_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markAllAsRead(userId: string, userModel: 'Teacher' | 'Student' | 'Admin'): Promise<void> {
    try {
      await this.notificationRepository.markAllAsRead(userId, userModel);
    } catch (error) {
      this.logger.error('Error in markAllAsRead:', error);
      throw createHttpError(NotificationMessage.MARK_ALL_READ_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await this.notificationRepository.deleteNotification(notificationId);
    } catch (error) {
      this.logger.error('Error in deleteNotification:', error);
      throw createHttpError(NotificationMessage.DELETE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
