// src/routes/notificationRoutes.ts
import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { NotificationUseCase } from '../../application/useCases/NotificationUseCase';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { isValidObjectId } from 'mongoose';

const router = Router();

const notificationRepository = new NotificationRepository();
const notificationUseCase = new NotificationUseCase(notificationRepository);
const notificationController = new NotificationController(notificationUseCase);

// Middleware to validate notification ID
const validateNotificationId = (req: any, res: any, next: any) => {
    const id = req.params.notificationId;
    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid notification ID format"
        });
    }
    next();
};

// Get notifications - Users can view their own notifications
router.get('/', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    notificationController.getNotifications.bind(notificationController)
);

// Mark notification as read - Users can mark their own notifications as read
router.put('/:notificationId/read',
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateNotificationId,
    notificationController.markAsRead.bind(notificationController)
);

// Mark all notifications as read - Users can mark all their notifications as read
router.put('/read-all', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    notificationController.markAllAsRead.bind(notificationController)
);

// Delete notification - Users can delete their own notifications
router.delete('/:notificationId', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateNotificationId,
    notificationController.deleteNotification.bind(notificationController)
);

export default router;