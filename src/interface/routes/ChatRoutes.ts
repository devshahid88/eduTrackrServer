// src/routes/chatRoutes.ts
import { Router, Request, Response } from 'express';
import { ChatController } from '../../interface/controllers/ChatController';
import { ChatUseCase } from '../../application/useCases/ChatUseCase';
import { ChatRepository } from '../../infrastructure/repositories/ChatRepository';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { Server } from 'socket.io';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../../infrastructure/services/cloudinary';
import { isValidObjectId } from 'mongoose';

// Configure multer storage for chat media uploads
const chatStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:async (req,res) => {return{
        folder: 'chat_media',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        resource_type: 'auto',
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Limit image size
            { quality: 'auto' } // Optimize quality
        ]
    }}
});

const upload = multer({
    storage: chatStorage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
        files: 1
    },
});

// Middleware to validate chat ID
const validateChatId = (req: any, res: any, next: any) => {
    const chatId = req.params.chatId;
    if (chatId && !isValidObjectId(chatId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid chat ID format"
        });
    }
    next();
};

export function createChatRoutes(io: Server): Router {
    const router = Router();
    
    const chatRepository = new ChatRepository();
    const notificationRepository = new NotificationRepository();
    const chatUseCase = new ChatUseCase(chatRepository, notificationRepository, io);
    const chatController = new ChatController(chatUseCase);

    // Error handling middleware for multer
    const handleMulterError = (err: any, req: Request, res: Response, next: Function) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File size too large. Maximum size is 20MB',
                    success: false
                });
            }
            return res.status(400).json({
                message: err.message,
                success: false
            });
        }
        next(err);
    };

    // Send message - All authenticated users can send messages
    router.post('/send', 
        authenticateToken,
        authorizeRoles(['student', 'teacher', 'admin']),
        upload.single('media'), 
        handleMulterError, 
        chatController.sendMessage.bind(chatController)
    );

    // Initiate chat - All authenticated users can initiate chats
    router.post('/initiate', 
        authenticateToken,
        authorizeRoles(['student', 'teacher', 'admin']),
        chatController.initiateChat.bind(chatController)
    );

    // Get chat list - All authenticated users can view their chat list
    router.get('/chatlist', 
        authenticateToken,
        authorizeRoles(['student', 'teacher', 'admin']),
        chatController.getChatList.bind(chatController)
    );

    // Get messages from specific chat - All authenticated users can view messages
    router.get('/:chatId', 
        authenticateToken,
        authorizeRoles(['student', 'teacher', 'admin']),
        validateChatId,
        chatController.getMessages.bind(chatController)
    );

    // Add reaction - All authenticated users can add reactions
    router.post('/reaction', 
        authenticateToken,
        authorizeRoles(['student', 'teacher', 'admin']),
        chatController.addReaction.bind(chatController)
    );

    // Delete message - All authenticated users can delete their own messages
    router.post('/delete', 
        authenticateToken,
        authorizeRoles(['student', 'teacher', 'admin']),
        chatController.deleteMessage.bind(chatController)
    );

    // Upload media - All authenticated users can upload media
    router.post('/upload', 
        authenticateToken,
        authorizeRoles(['student', 'teacher', 'admin']),
        upload.single('media'), 
        handleMulterError, 
        chatController.uploadMedia.bind(chatController)
    );

    return router;
}