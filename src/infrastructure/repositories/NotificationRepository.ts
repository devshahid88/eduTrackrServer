import mongoose from 'mongoose';
import { INotification, Notification as NotificationModel } from '../models/notification.models';
import { INotificationRepository } from '../../application/Interfaces/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';
import { BaseRepository } from "./BaseRepository";
import { NotificationMapper } from "../mappers/NotificationMapper";

import { ILogger } from '../../application/Interfaces/ILogger';

export class NotificationRepository extends BaseRepository<Notification, INotification> implements INotificationRepository {
  
  constructor(private logger: ILogger) {
    super(NotificationModel);
  }

  protected toEntity(model: INotification): Notification {
    return NotificationMapper.toDomain(model);
  }

  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    const newNotification = await this._model.create(notification);
    return this.toEntity(newNotification);
  }

  async getNotifications(userId: string, userModel: 'Teacher' | 'Student' | 'Admin'): Promise<Notification[]> {
    try {
      // Normalize userModel to ensure proper case
      const normalizedUserModel = userModel.charAt(0).toUpperCase() + userModel.slice(1).toLowerCase();

      const notifications = await this._model.find({
        userId: new mongoose.Types.ObjectId(userId),
        userModel: normalizedUserModel
      })
      .sort({ timestamp: -1 })
      .limit(50);

      return notifications.map(n => this.toEntity(n));
    } catch (error) {
      this.logger.error('Error in getNotifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await this._model.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return this.toEntity(notification);
    } catch (error) {
      this.logger.error('Error in markAsRead:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string, userModel: 'Teacher' | 'Student' | 'Admin'): Promise<void> {
    try {
      await this._model.updateMany(
        {
          userId: new mongoose.Types.ObjectId(userId),
          userModel,
          read: false
        },
        { read: true }
      );
    } catch (error) {
      this.logger.error('Error in markAllAsRead:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const result = await this.delete(notificationId);
      if (!result) {
        throw new Error('Notification not found'); // delete returns false if not found? BaseRepository implementation: const result = await this._model.findByIdAndDelete(id); return !!result;
      }
    } catch (error) {
      this.logger.error('Error in deleteNotification:', error);
      throw new Error('Failed to delete notification');
    }
  }
} 
