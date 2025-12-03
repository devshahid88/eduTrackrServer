import mongoose from 'mongoose';
import { INotification, Notification } from '../models/notification.models';
import { INotificationRepository } from '../../application/Interfaces/INotificationRepository';

export class NotificationRepository implements INotificationRepository {
  async createNotification(notification: Partial<INotification>): Promise<INotification> {
    try {
      const newNotification = await Notification.create(notification);
      return newNotification;
    } catch (error) {
      console.error('Error in createNotification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async getNotifications(userId: string, userModel: 'Teacher' | 'Student'): Promise<INotification[]> {
    try {
      // Normalize userModel to ensure proper case
      const normalizedUserModel = userModel.charAt(0).toUpperCase() + userModel.slice(1).toLowerCase();

      const notifications = await Notification.find({
        userId: new mongoose.Types.ObjectId(userId),
        userModel: normalizedUserModel
      })
      .sort({ timestamp: -1 })
      .limit(50);

      return notifications;
    } catch (error) {
      console.error('Error in getNotifications:', error);
      throw new Error('Failed to get notifications');
    }
  }

  async markAsRead(notificationId: string): Promise<INotification> {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string, userModel: 'Teacher' | 'Student'): Promise<void> {
    try {
      await Notification.updateMany(
        {
          userId: new mongoose.Types.ObjectId(userId),
          userModel,
          read: false
        },
        { read: true }
      );
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const result = await Notification.findByIdAndDelete(notificationId);
      if (!result) {
        throw new Error('Notification not found');
      }
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      throw new Error('Failed to delete notification');
    }
  }
} 