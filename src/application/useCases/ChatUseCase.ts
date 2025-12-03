// ChatUseCase.ts
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { IChatRepository } from '../../application/Interfaces/IChatRepository';
import { INotificationRepository } from '../../application/Interfaces/INotificationRepository';
import Chatlist from '../../domain/entities/Chatlist';
import Message from '../../domain/entities/Message';
import { ChatMessage } from '../../common/enums/http-message.enum';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class ChatUseCase {
  constructor(
    private chatRepository: IChatRepository,
    private notificationRepository: INotificationRepository,
    private io: Server
  ) {}

  async initiateChat(teacherId: string, studentId: string): Promise<string> {
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      createHttpError(ChatMessage.INVALID_USER_ID, HttpStatus.BAD_REQUEST);
    }

    try {
      const chatId = await this.chatRepository.initiateChat(teacherId, studentId);

      this.io.to(teacherId).emit('newChat', {
        chatId,
        contact: studentId,
        contactModel: 'Student',
        timestamp: new Date()
      });

      this.io.to(studentId).emit('newChat', {
        chatId,
        contact: teacherId,
        contactModel: 'Teacher',
        timestamp: new Date()
      });

      return chatId;
    } catch (error) {
      console.error(ChatMessage.CHAT_INITIATION_FAILED, error);
      createHttpError(ChatMessage.CHAT_INITIATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async saveMessage(
    chatId: string,
    sender: string,
    senderModel: 'Teacher' | 'Student',
    receiver: string,
    receiverModel: 'Teacher' | 'Student',
    message: string,
    mediaUrl?: string,
    mediaType?: string,
    replyTo?: string
  ): Promise<Message> {
    if (!chatId || !sender || !senderModel || !receiver || !receiverModel) {
      createHttpError(ChatMessage.MISSING_REQUIRED_FIELDS, HttpStatus.BAD_REQUEST);
    }
    if (!message && !mediaUrl) {
      createHttpError(ChatMessage.MESSAGE_OR_MEDIA_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const messageData = {
      chatId,
      sender: new mongoose.Types.ObjectId(sender),
      senderModel,
      receiver: new mongoose.Types.ObjectId(receiver),
      receiverModel,
      message,
      mediaUrl,
      mediaType,
      replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : undefined,
      timestamp: new Date()
    };

    try {
      const savedMessage = await this.chatRepository.saveMessage(messageData);

      await this.chatRepository.updateChatList(sender, {
        chatId,
        contact: receiver,
        contactModel: receiverModel,
        lastMessage: message || (mediaUrl ? 'Media message' : ''),
        timestamp: savedMessage.timestamp
      });

      await this.chatRepository.updateChatList(receiver, {
        chatId,
        contact: sender,
        contactModel: senderModel,
        lastMessage: message || (mediaUrl ? 'Media message' : ''),
        timestamp: savedMessage.timestamp
      });

      await this.chatRepository.incrementUnreadCount(receiver, chatId);

      await this.notificationRepository.createNotification({
        userId: new mongoose.Types.ObjectId(receiver),
        userModel: receiverModel,
        type: mediaUrl ? 'media' : 'message',
        title: `New message from ${senderModel}`,
        message: message || (mediaUrl ? 'Media message' : 'New message'),
        sender,
        senderModel,
        role: receiverModel,
        data: {
          chatId,
          messageId: savedMessage.id,
          sender,
          senderModel
        }
      });

      this.io.to(sender).emit('receiveMessage', savedMessage);
      this.io.to(receiver).emit('receiveMessage', savedMessage);
      this.io.to(chatId).emit('typing', { userId: sender, isTyping: false });

      return savedMessage;
    } catch (error) {
      console.error(ChatMessage.MESSAGE_SAVE_FAILED, error);
      createHttpError(ChatMessage.MESSAGE_SAVE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMessages(chatId: string, userId: string): Promise<Message[]> {
    if (!chatId) {
      createHttpError(ChatMessage.CHAT_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    try {
      const messages = await this.chatRepository.getMessages(chatId);
      await this.chatRepository.resetUnreadCount(userId, chatId);
      return messages;
    } catch (error) {
      console.error(ChatMessage.MESSAGE_FETCH_FAILED, error);
      createHttpError(ChatMessage.MESSAGE_FETCH_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getChatList(userId: string): Promise<Chatlist | null> {
    if (!userId) {
      createHttpError(ChatMessage.USER_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.chatRepository.getChatList(userId);
    } catch (error) {
      console.error(ChatMessage.CHAT_LIST_FETCH_FAILED, error);
      createHttpError(ChatMessage.CHAT_LIST_FETCH_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addReaction(messageId: string, userId: string, reaction: string): Promise<Message> {
    try {
      const updatedMessage = await this.chatRepository.addReaction(messageId, userId, reaction);

      this.io.to(updatedMessage.sender.toString()).emit('messageReaction', {
        messageId: updatedMessage.id,
        reaction,
        userId
      });

      this.io.to(updatedMessage.receiver.toString()).emit('messageReaction', {
        messageId: updatedMessage.id,
        reaction,
        userId
      });

      return updatedMessage;
    } catch (error) {
      console.error(ChatMessage.REACTION_FAILED, error);
      createHttpError(ChatMessage.REACTION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message> {
    try {
      const deletedMessage = await this.chatRepository.deleteMessage(messageId, userId);

      this.io.to(deletedMessage.sender.toString()).emit('messageDeleted', {
        messageId: deletedMessage.id
      });

      this.io.to(deletedMessage.receiver.toString()).emit('messageDeleted', {
        messageId: deletedMessage.id
      });

      return deletedMessage;
    } catch (error) {
      console.error(ChatMessage.MESSAGE_DELETE_FAILED, error);
      createHttpError(ChatMessage.MESSAGE_DELETE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  handleUserConnection(socket: Socket, userId: string, userModel: 'Teacher' | 'Student'): void {
    console.log(`${ChatMessage.USER_CONNECTED}: ${userId} (${userModel})`);
    socket.join(userId);

    this.chatRepository.getChatList(userId).then(chatList => {
      if (chatList) {
        chatList.chats.forEach(chat => {
          socket.join(chat.chatId);
        });
      }
    }).catch(error => {
      console.error('Error joining existing chats:', error);
    });
  }

  handleUserDisconnection(userId: string, userModel: 'Teacher' | 'Student'): void {
    console.log(`${ChatMessage.USER_DISCONNECTED}: ${userId} (${userModel})`);
  }

  handleTyping(socket: Socket, chatId: string, userId: string, isTyping: boolean): void {
    socket.to(chatId).emit('typing', { userId, isTyping });
  }

  handleSeen(socket: Socket, chatId: string, userId: string): void {
    socket.to(chatId).emit('messageSeen', { userId, chatId });
  }
}
