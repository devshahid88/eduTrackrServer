import mongoose from 'mongoose';
import Chatlist from '../../domain/entities/Chatlist';
import MessageEntity from '../../domain/entities/Message';

export interface IChatRepository {
  initiateChat(teacherId: string, studentId: string): Promise<string>;
  saveMessage(message: Partial<MessageEntity>): Promise<MessageEntity>;
  getMessages(chatId: string): Promise<MessageEntity[]>;
  getChatList(userId: string): Promise<Chatlist | null>;
  addReaction(messageId: string, userId: string, reaction: string): Promise<MessageEntity>;
  deleteMessage(messageId: string, userId: string): Promise<MessageEntity>;
  incrementUnreadCount(userId: string, chatId: string): Promise<void>;
  resetUnreadCount(userId: string, chatId: string): Promise<void>;
  saveChatList(chatList: Chatlist): Promise<Chatlist | null>;
  updateChatList(userId: string, chatData: {
    chatId: string;
    contact: string;
    contactModel: 'Teacher' | 'Student';
    lastMessage: string;
    timestamp: Date;
  }): Promise<void>;
}