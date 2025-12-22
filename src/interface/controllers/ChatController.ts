import { Request, Response, NextFunction } from 'express';
import { ChatUseCase } from '../../application/useCases/ChatUseCase';
import mongoose from 'mongoose';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class ChatController {
  constructor(private chatUseCase: ChatUseCase) {}

  async initiateChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('ChatController - initiateChat:', req.body);
    try {
      const { teacherId, studentId, initiatorId, receiverId, initiatorType } = req.body;
      let finalTeacherId: string;
      let finalStudentId: string;

      if (teacherId && studentId) {
        finalTeacherId = teacherId;
        finalStudentId = studentId;
      } else if (initiatorId && receiverId && initiatorType) {
        if (initiatorType === 'Student') {
          finalStudentId = initiatorId;
          finalTeacherId = receiverId;
        } else if (initiatorType === 'Teacher') {
          finalTeacherId = initiatorId;
          finalStudentId = receiverId;
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid initiatorType', success: false });
          return;
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Required fields missing', success: false });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(finalTeacherId) || !mongoose.Types.ObjectId.isValid(finalStudentId)) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid ID format', success: false });
        return;
      }

      const chatId = await this.chatUseCase.initiateChat(finalTeacherId, finalStudentId);
      res.status(HttpStatus.OK).json({ message: 'Chat initiated successfully', data: { chatId }, success: true });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chatId, sender, senderModel, receiver, receiverModel, message, replyTo, mediaUrl: bodyMediaUrl } = req.body;
      const mediaUrl = req.file?.path || bodyMediaUrl;


      if (!chatId || !sender || !senderModel || !receiver || !receiverModel) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Missing required fields', success: false });
        return;
      }

      if (!message && !mediaUrl) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Message or media required', success: false });
        return;
      }

      if (!['Teacher', 'Student'].includes(senderModel) || !['Teacher', 'Student'].includes(receiverModel)) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid sender or receiver model', success: false });
        return;
      }

      const messageData = await this.chatUseCase.saveMessage(
        chatId, sender, senderModel, receiver, receiverModel, message, mediaUrl, replyTo
      );

      res.status(HttpStatus.CREATED).json({ message: 'Message sent successfully', data: messageData, success: true });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chatId } = req.params;
      const { userId } = req.query;

      if (!chatId || !userId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Chat ID and User ID are required', success: false });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(userId as string)) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid chat ID or user ID format', success: false });
        return;
      }

      const messages = await this.chatUseCase.getMessages(chatId, userId as string);
      res.status(HttpStatus.OK).json({ message: 'Messages retrieved successfully', data: messages, success: true });
    } catch (error) {
      next(error);
    }
  }

  async getChatList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid or missing User ID', success: false });
        return;
      }

      const chatList = await this.chatUseCase.getChatList(userId as string);
      res.status(HttpStatus.OK).json({ message: 'Chat list retrieved successfully', data: chatList, success: true });
    } catch (error) {
      next(error);
    }
  }

  async addReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId, userId, reaction } = req.body;
      if (!messageId || !userId || !reaction) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Missing required fields', success: false });
        return;
      }

      const updatedMessage = await this.chatUseCase.addReaction(messageId, userId, reaction);
      res.status(HttpStatus.OK).json({ message: 'Reaction added successfully', data: updatedMessage, success: true });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId, userId } = req.body;
      if (!messageId || !userId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Missing required fields', success: false });
        return;
      }

      const deletedMessage = await this.chatUseCase.deleteMessage(messageId, userId);
      res.status(HttpStatus.OK).json({ message: 'Message deleted successfully', data: deletedMessage, success: true });
    } catch (error) {
      next(error);
    }
  }

  async uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'No file uploaded', success: false });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: 'File uploaded successfully',
        data: {
          url: req.file.path,
          filename: req.file.originalname,
          mimetype: req.file.mimetype
        },
        success: true
      });
    } catch (error) {
      next(error);
    }
  }
}
