import mongoose from 'mongoose';
import { IChatRepository } from '../../application/Interfaces/IChatRepository';
import { IChatList, IMessage, Message, ChatList } from '../../infrastructure/models/chat.models';
import Chatlist from '../../domain/entities/Chatlist';
import MessageEntity from '../../domain/entities/Message';

export class ChatRepository implements IChatRepository {
  async initiateChat(teacherId: string, studentId: string): Promise<string> {
    console.log('Initiating chat between teacher:', teacherId, 'and student:', studentId);
    try {
      const chatId = new mongoose.Types.ObjectId().toString();
      const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
      const studentObjectId = new mongoose.Types.ObjectId(studentId);

      // Check if chat already exists for this teacher-student pair in teacher's ChatList
      
      const existingTeacherChatList = await ChatList.findOne({
        user: teacherObjectId,
        userModel: 'Teacher',
        'chats.contact': studentObjectId
      });

      if (existingTeacherChatList) {
        // Find the chatId for this pair
        const chat = existingTeacherChatList.chats.find(
          (c: any) => c.contact.toString() === studentObjectId.toString()
        );
        if (chat) {
          console.log(`initiateChat: Chat already exists for teacher (${teacherId}) and student (${studentId}), chatId: ${chat.chatId}`);
          return chat.chatId;
        }
      }

      // Add chat to teacher's ChatList (create if not exists)
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
      console.log(`initiateChat: Updated ChatList for teacher: ${teacherId}`);

      // Add chat to student's ChatList (create if not exists)
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
      console.log(`initiateChat: Updated ChatList for student: ${studentId}`);

      return chatId;
    } catch (error) {
      console.error('Error in initiateChat:', error);
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

      console.log('Saving message with data:', {
        chatId: message.chatId,
        sender: senderObjectId,
        senderModel: message.senderModel,
        receiver: receiverObjectId,
        receiverModel: message.receiverModel,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        replyTo: replyToObjectId
      });

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

      // Update chat lists using the updateChatList method
      const lastMessage = message.message || (message.mediaUrl ? 'Media sent' : '');

      // Update sender's chat list
      await this.updateChatList(senderObjectId.toString(), {
        chatId: message.chatId!,
        contact: receiverObjectId.toString(),
        contactModel: message.receiverModel!,
        lastMessage,
        timestamp: savedMessage.timestamp
      });

      // Update receiver's chat list
      await this.updateChatList(receiverObjectId.toString(), {
        chatId: message.chatId!,
        contact: senderObjectId.toString(),
        contactModel: message.senderModel!,
        lastMessage,
        timestamp: savedMessage.timestamp
      });

      return new MessageEntity({
        id: savedMessage._id.toString(),
        chatId: savedMessage.chatId,
        sender: savedMessage.sender,
        senderModel: savedMessage.senderModel,
        receiver: savedMessage.receiver,
        receiverModel: savedMessage.receiverModel,
        message: savedMessage.message,
        mediaUrl: savedMessage.mediaUrl,
        mediaType: savedMessage.mediaType,
        replyTo: savedMessage.replyTo,
        reactions: savedMessage.reactions,
        timestamp: savedMessage.timestamp,
        isDeleted: savedMessage.isDeleted,
      });
    } catch (error) {
      console.error('Error in saveMessage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to save message: ${errorMessage}`);
    }
  }

  async getMessages(chatId: string): Promise<MessageEntity[]> {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }

      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error('Invalid chat ID format');
      }

      console.log('ChatRepository - getMessages:', { chatId });

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

      console.log(`Found ${messages.length} messages for chat:`, chatId);
      
      // Convert MongoDB documents to MessageEntity instances
      return messages.map(message => new MessageEntity({
        id: message._id.toString(),
        chatId: message.chatId,
        sender: message.sender,
        senderModel: message.senderModel,
        receiver: message.receiver,
        receiverModel: message.receiverModel,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        replyTo: message.replyTo,
        reactions: message.reactions || [],
        timestamp: message.timestamp,
        isDeleted: message.isDeleted || false,
      }));
    } catch (error) {
      console.error('Error in ChatRepository.getMessages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch messages: ${errorMessage}`);
    }
  }

  async getChatList(userId: string): Promise<Chatlist | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format');
      }

      console.log('ChatRepository - getChatList:', { userId });

      const chatList = await ChatList.findOne({ user: userId })
        .populate({
          path: 'chats.contact',
          select: 'firstname lastname username profileImage email username'
        })
        .lean();

      if (!chatList) {
        console.log('No chat list found for user:', userId);
        return null;
      }

      console.log('Found chat list:', {
        id: chatList._id,
        user: chatList.user,
        chatsCount: chatList.chats.length
      });

      return chatList;
    } catch (error) {
      console.error('Error in ChatRepository.getChatList:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch chat list: ${errorMessage}`);
    }
  }

  async addReaction(messageId: string, userId: string, reaction: string): Promise<MessageEntity> {
    try {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error('Invalid message ID format');
      }

      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error(`Message with ID ${messageId} not found`);
      }
      
      if (message.isDeleted) {
        throw new Error(`Message with ID ${messageId} has been deleted`);
      }

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
      return new MessageEntity({
        id: message._id.toString(),
        chatId: message.chatId,
        sender: message.sender,
        senderModel: message.senderModel,
        receiver: message.receiver,
        receiverModel: message.receiverModel,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        replyTo: message.replyTo,
        reactions: message.reactions,
        timestamp: message.timestamp,
        isDeleted: message.isDeleted,
      });
    } catch (error) {
      console.error('Error in addReaction:', error);
      if (error instanceof Error) {
        throw error; // Re-throw the original error to preserve the error message
      }
      throw new Error('Failed to add reaction');
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<MessageEntity> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }
      if (message.sender.toString() !== userId) {
        throw new Error('Unauthorized to delete this message');
      }

      message.isDeleted = true;
      await message.save();

      return new MessageEntity({
        id: message._id.toString(),
        chatId: message.chatId,
        sender: message.sender,
        senderModel: message.senderModel,
        receiver: message.receiver,
        receiverModel: message.receiverModel,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        replyTo: message.replyTo,
        reactions: message.reactions,
        timestamp: message.timestamp,
        isDeleted: message.isDeleted,
      });
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete message: ${errorMessage}`);
    }
  }

  async incrementUnreadCount(userId: string, chatId: string): Promise<void> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      await ChatList.updateOne(
        { 
          user: userObjectId,
          'chats.chatId': chatId
        },
        { 
          $inc: { 'chats.$.unreadCount': 1 }
        }
      );
    } catch (error) {
      console.error('Error in incrementUnreadCount:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to increment unread count: ${errorMessage}`);
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

      // Try to update existing chat
      const updateResult = await ChatList.updateOne(
        { 
          user: userObjectId,
          'chats.chatId': chatData.chatId
        },
        { 
          $set: { 
            'chats.$.lastMessage': chatData.lastMessage,
            'chats.$.timestamp': chatData.timestamp
          }
        }
      );

      // If no existing chat was updated, this means we need to add a new chat entry
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
    } catch (error) {
      console.error('Error in updateChatList:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update chat list: ${errorMessage}`);
    }
  }

  async resetUnreadCount(userId: string, chatId: string): Promise<void> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      await ChatList.updateOne(
        { 
          user: userObjectId,
          'chats.chatId': chatId
        },
        { 
          $set: { 'chats.$.unreadCount': 0 }
        }
      );
    } catch (error) {
      console.error('Error in resetUnreadCount:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to reset unread count: ${errorMessage}`);
    }
  }

  async saveChatList(chatList: Chatlist): Promise<Chatlist | null> {
    try {
      // This method would depend on your Chatlist entity structure
      // Since it's not fully implemented in your original code, here's a basic implementation
      const savedChatList = await ChatList.create(chatList);
      return savedChatList;
    } catch (error) {
      console.error('Error in saveChatList:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to save chat list: ${errorMessage}`);
    }
  }
}
