import mongoose from 'mongoose';
import { IChatRepository } from '../../application/Interfaces/IChatRepository';
import { Message, ChatList } from '../../infrastructure/models/chat.models';
import Chatlist from '../../domain/entities/Chatlist';
import MessageEntity from '../../domain/entities/Message';
import { ILogger } from '../../application/Interfaces/ILogger';
import { MessageMapper } from '../mappers/MessageMapper';
import { ChatListMapper } from '../mappers/ChatListMapper';

export class ChatRepository implements IChatRepository {
  constructor(private logger: ILogger) {}

  async initiateChat(teacherId: string, studentId: string): Promise<string> {
    this.logger.info(`Initiating chat between teacher: ${teacherId} and student: ${studentId}`);
    try {
      const chatId = new mongoose.Types.ObjectId().toString();
      const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
      const studentObjectId = new mongoose.Types.ObjectId(studentId);

      const existingTeacherChatList = await ChatList.findOne({
        user: teacherObjectId,
        userModel: 'Teacher',
        'chats.contact': studentObjectId
      });

      if (existingTeacherChatList) {
        const chat = existingTeacherChatList.chats.find(
          (c: any) => c.contact.toString() === studentObjectId.toString()
        );
        if (chat) {
          this.logger.debug(`initiateChat: Chat already exists for teacher (${teacherId}) and student (${studentId}), chatId: ${chat.chatId}`);
          return chat.chatId;
        }
      }

      await ChatList.findOneAndUpdate(
        { user: teacherObjectId, userModel: 'Teacher' },
        {
          $push: {
            chats: {
              chatId,
              contact: studentObjectId,
              contactModel: 'Student',
              lastMessage: '',
              timestamp: new Date(),
              unreadCount: 0
            }
          },
          $setOnInsert: {
            teacherId: teacherObjectId,
            studentId: studentObjectId
          }
        },
        { upsert: true, new: true }
      );

      await ChatList.findOneAndUpdate(
        { user: studentObjectId, userModel: 'Student' },
        {
          $push: {
            chats: {
              chatId,
              contact: teacherObjectId,
              contactModel: 'Teacher',
              lastMessage: '',
              timestamp: new Date(),
              unreadCount: 0
            }
          },
          $setOnInsert: {
            teacherId: teacherObjectId,
            studentId: studentObjectId
          }
        },
        { upsert: true, new: true }
      );

      return chatId;
    } catch (error: any) {
      this.logger.error('Error in initiateChat:', error);
      throw new Error('Failed to initiate chat');
    }
  }

  async saveMessage(message: Partial<MessageEntity>): Promise<MessageEntity> {
    try {
      const senderObjectId = message.sender
        ? new mongoose.Types.ObjectId(message.sender.toString())
        : undefined;
      const receiverObjectId = message.receiver
        ? new mongoose.Types.ObjectId(message.receiver.toString())
        : undefined;
      const replyToObjectId = message.replyTo
        ? new mongoose.Types.ObjectId(message.replyTo.toString())
        : undefined;

      if (!senderObjectId || !receiverObjectId) {
        throw new Error('Sender and receiver IDs are required');
      }

      this.logger.info(`Saving message for chatId: ${message.chatId}`);

      const savedMessage = await Message.create({
        chatId: message.chatId,
        sender: senderObjectId,
        senderModel: message.senderModel,
        receiver: receiverObjectId,
        receiverModel: message.receiverModel,
        message: message.message || undefined,
        mediaUrl: message.mediaUrl || undefined,
        mediaType: message.mediaType || undefined,
        replyTo: replyToObjectId,
        timestamp: message.timestamp || new Date(),
        isDeleted: false,
      });

      const lastMessage = message.message || (message.mediaUrl ? 'Media sent' : '');

      await this.updateChatList(senderObjectId.toString(), {
        chatId: message.chatId!,
        contact: receiverObjectId.toString(),
        contactModel: message.receiverModel!,
        lastMessage,
        timestamp: savedMessage.timestamp
      });

      await this.updateChatList(receiverObjectId.toString(), {
        chatId: message.chatId!,
        contact: senderObjectId.toString(),
        contactModel: message.senderModel!,
        lastMessage,
        timestamp: savedMessage.timestamp
      });

      return MessageMapper.toDomain(savedMessage);
    } catch (error: any) {
      this.logger.error('Error in saveMessage:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  async getMessages(chatId: string): Promise<MessageEntity[]> {
    try {
      if (!chatId) throw new Error('Chat ID is required');
      
      this.logger.debug(`Fetching messages for chatId: ${chatId}`);

      const messages = await Message.find({ 
        chatId, 
        isDeleted: false 
      })
      .populate('sender', 'name username')
      .populate('receiver', 'name username')
      .populate({
        path: 'replyTo',
        select: 'message mediaUrl sender senderModel',
        populate: {
          path: 'sender',
          select: 'name username'
        }
      })
      .sort({ timestamp: 1 })
      .lean();

      return messages.map(message => MessageMapper.toDomain(message));
    } catch (error: any) {
      this.logger.error('Error in getMessages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  async getChatList(userId: string): Promise<Chatlist | null> {
    try {
      if (!userId) throw new Error('User ID is required');

      this.logger.debug(`Fetching chat list for userId: ${userId}`);

      const chatList = await ChatList.findOne({ user: userId })
        .populate({
          path: 'chats.contact',
          select: 'firstname lastname username profileImage email username'
        })
        .lean();

      if (chatList && chatList.chats) {
        chatList.chats = chatList.chats.filter((c: any) => c.contact);
        chatList.chats.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }

      return chatList ? ChatListMapper.toDomain(chatList) : null;
    } catch (error: any) {
      this.logger.error('Error in getChatList:', error);
      throw new Error(`Failed to fetch chat list: ${error.message}`);
    }
  }

  async addReaction(messageId: string, userId: string, reaction: string): Promise<MessageEntity> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw new Error(`Message with ID ${messageId} not found`);
      if (message.isDeleted) throw new Error(`Message with ID ${messageId} has been deleted`);

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const existingReactionIndex = message.reactions.findIndex(
        r => r.user.toString() === userId
      );

      if (existingReactionIndex !== -1) {
        message.reactions[existingReactionIndex].reaction = reaction;
      } else {
        message.reactions.push({ user: userObjectId, reaction });
      }

      await message.save();
      return MessageMapper.toDomain(message);
    } catch (error: any) {
      this.logger.error('Error in addReaction:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<MessageEntity> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw new Error('Message not found');
      if (message.sender.toString() !== userId) throw new Error('Unauthorized to delete this message');

      message.isDeleted = true;
      await message.save();

      return MessageMapper.toDomain(message);
    } catch (error: any) {
      this.logger.error('Error in deleteMessage:', error);
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  async incrementUnreadCount(userId: string, chatId: string): Promise<void> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      await ChatList.updateOne(
        { user: userObjectId, 'chats.chatId': chatId },
        { $inc: { 'chats.$.unreadCount': 1 } }
      );
    } catch (error: any) {
      this.logger.error('Error in incrementUnreadCount:', error);
      throw new Error(`Failed to increment unread count: ${error.message}`);
    }
  }

  async updateChatList(userId: string, chatData: {
    chatId: string;
    contact: string;
    contactModel: 'Teacher' | 'Student';
    lastMessage: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const contactObjectId = new mongoose.Types.ObjectId(chatData.contact);

      const updateResult = await ChatList.updateOne(
        { user: userObjectId, 'chats.chatId': chatData.chatId },
        { 
          $set: { 
            'chats.$.lastMessage': chatData.lastMessage,
            'chats.$.timestamp': chatData.timestamp
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        await ChatList.updateOne(
          { user: userObjectId },
          { 
            $push: { 
              chats: {
                chatId: chatData.chatId,
                contact: contactObjectId,
                contactModel: chatData.contactModel,
                lastMessage: chatData.lastMessage,
                timestamp: chatData.timestamp,
                unreadCount: 0
              }
            }
          },
          { upsert: true }
        );
      }
    } catch (error: any) {
      this.logger.error('Error in updateChatList:', error);
      throw new Error(`Failed to update chat list: ${error.message}`);
    }
  }

  async resetUnreadCount(userId: string, chatId: string): Promise<void> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      await ChatList.updateOne(
        { user: userObjectId, 'chats.chatId': chatId },
        { $set: { 'chats.$.unreadCount': 0 } }
      );
    } catch (error: any) {
      this.logger.error('Error in resetUnreadCount:', error);
      throw new Error(`Failed to reset unread count: ${error.message}`);
    }
  }

  async saveChatList(chatList: Chatlist): Promise<Chatlist | null> {
    try {
      const savedChatList = await ChatList.create(chatList);
      return ChatListMapper.toDomain(savedChatList);
    } catch (error: any) {
      this.logger.error('Error in saveChatList:', error);
      throw new Error(`Failed to save chat list: ${error.message}`);
    }
  }
}

