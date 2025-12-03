import mongoose, { Schema } from 'mongoose';

export interface IMessage {
  _id: string;
  chatId: string;
  sender: mongoose.Types.ObjectId;
  senderModel: 'Teacher' | 'Student';
  receiver: mongoose.Types.ObjectId;
  receiverModel: 'Teacher' | 'Student';
  message?: string;
  mediaUrl?: string;
  mediaType?: string;
  replyTo?: mongoose.Types.ObjectId;
  reactions: { user: mongoose.Types.ObjectId; reaction: string }[];
  timestamp: Date;
  isDeleted?: boolean;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true, index: true },
  sender: { type: Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  senderModel: { type: String, enum: ['Teacher', 'Student'], required: true },
  receiver: { type: Schema.Types.ObjectId, required: true, refPath: 'receiverModel' },
  receiverModel: { type: String, enum: ['Teacher', 'Student'], required: true },
  message: { type: String },
  mediaUrl: { type: String },
  mediaType: { type: String, enum: ['image', 'document', 'video'] },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  reactions: [
    {
      user: { type: Schema.Types.ObjectId, required: true },
      reaction: { type: String, enum: ['❤️', '😂', '😢', '💯', '👍', '👎'], required: true },
    },
  ],
  timestamp: { type: Date, default: Date.now, index: true },
  isDeleted: { type: Boolean, default: false },
});

// Add compound indexes for better query performance
MessageSchema.index({ chatId: 1, timestamp: -1 });
MessageSchema.index({ sender: 1, receiver: 1 });

export interface IChatList {
  _id: string;
  user: mongoose.Types.ObjectId;
  userModel: 'Teacher' | 'Student';
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  chats: {
    chatId: string;
    contact: mongoose.Types.ObjectId;
    contactModel: 'Teacher' | 'Student';
    lastMessage: string;
    timestamp: Date;
    unreadCount?: number;
  }[];
}

const ChatListSchema = new Schema<IChatList>({
  user: { type: Schema.Types.ObjectId, required: true, refPath: 'userModel' },
  userModel: { type: String, enum: ['Teacher', 'Student'], required: true },
  teacherId: { type: Schema.Types.ObjectId, required: true, ref: 'Teacher' },
  studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Student' },
  chats: [
    {
      chatId: { type: String, required: true },
      contact: { type: Schema.Types.ObjectId, required: true, refPath: 'chats.contactModel' },
      contactModel: { type: String, enum: ['Teacher', 'Student'], required: true },
      lastMessage: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
      unreadCount: { type: Number, default: 0 }
    },
  ],
});

// Add indexes for better query performance
ChatListSchema.index({ user: 1, userModel: 1 });
ChatListSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });
ChatListSchema.index({ 'chats.chatId': 1 });

// Add a method to update chat list
ChatListSchema.methods.updateChat = async function(chatData: {
  chatId: string;
  contact: mongoose.Types.ObjectId;
  contactModel: 'Teacher' | 'Student';
  lastMessage: string;
  timestamp: Date;
}) {
  const chatIndex = this.chats.findIndex(
    (chat: { chatId: string; contact: mongoose.Types.ObjectId }) => 
      chat.chatId === chatData.chatId && 
      chat.contact.toString() === chatData.contact.toString()
  );

  if (chatIndex !== -1) {
    this.chats[chatIndex].lastMessage = chatData.lastMessage;
    this.chats[chatIndex].timestamp = chatData.timestamp;
    // Reset unread count for the sender
    this.chats[chatIndex].unreadCount = 0;
  } else {
    this.chats.push({
      ...chatData,
      unreadCount: 0
    });
  }

  return this.save();
};

// Add a method to increment unread count
ChatListSchema.methods.incrementUnreadCount = async function(chatId: string) {
  const chatIndex = this.chats.findIndex(
    (chat: { chatId: string }) => chat.chatId === chatId
  );

  if (chatIndex !== -1) {
    this.chats[chatIndex].unreadCount += 1;
    return this.save();
  }
};

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const ChatList = mongoose.model<IChatList>('ChatList', ChatListSchema);