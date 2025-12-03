import { Request, Response, NextFunction } from 'express';
import { NotificationUseCase } from '../../application/useCases/NotificationUseCase';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class NotificationController {
  constructor(private notificationUseCase: NotificationUseCase) {}

async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract id and role from req.user (set by authenticateToken middleware)
    // Note: JWT contains 'id' and 'role', not 'userId' and 'userModel'
    const { id: userId, role: userModel } = req.user || {};

    console.log('Getting notifications for:', { userId, userModel });

    if (!userId || !userModel) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Missing required fields: userId and userModel are required',
        success: false
      });
      return;
    }

    const normalizedUserModel = userModel.charAt(0).toUpperCase() +
      userModel.slice(1).toLowerCase();

    if (!['Teacher', 'Student', 'Admin'].includes(normalizedUserModel)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid user model. Must be "Teacher", "Student", or "Admin"',
        success: false
      });
      return;
    }

    const notifications = await this.notificationUseCase.getNotifications(
      userId as string,
      normalizedUserModel as 'Teacher' | 'Student'
    );

    // Transform notifications to match frontend expectations
    const transformedNotifications = notifications.map(notification => ({
      _id: notification._id.toString(), // Frontend expects _id, not id
      type: notification.type,
      title: notification.title, // Include title field
      message: notification.message,
      sender: notification.sender,
      senderModel: notification.senderModel, // Include senderModel if needed
      role: notification.role,
      read: notification.read,
      timestamp: notification.timestamp,
      data: notification.data
    }));

    // Calculate unread count
    const unreadCount = transformedNotifications.filter(n => !n.read).length;

    res.status(HttpStatus.OK).json({
      message: 'Notifications retrieved successfully',
      data: transformedNotifications,
      unreadCount: unreadCount, // Include unread count for frontend
      success: true
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    next(error);
  }
}

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Notification ID is required',
          success: false
        });
        return;
      }

      const notification = await this.notificationUseCase.markAsRead(notificationId);

      res.status(HttpStatus.OK).json({
        message: 'Notification marked as read',
        data: notification,
        success: true
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userModel } = req.body;

      if (!userId || !userModel) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Missing required fields',
          success: false
        });
        return;
      }

      if (!['Teacher', 'Student'].includes(userModel)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid user model',
          success: false
        });
        return;
      }

      await this.notificationUseCase.markAllAsRead(userId, userModel);

      res.status(HttpStatus.OK).json({
        message: 'All notifications marked as read',
        success: true
      });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      next(error);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Notification ID is required',
          success: false
        });
        return;
      }

      await this.notificationUseCase.deleteNotification(notificationId);

      res.status(HttpStatus.OK).json({
        message: 'Notification deleted successfully',
        success: true
      });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      next(error);
    }
  }
}
