import mongoose from 'mongoose';

export class Chatlist {
  public _id!: string; // Changed from id to _id
  public user!: mongoose.Types.ObjectId | string;
  public userModel!: 'Teacher' | 'Student';
  public teacherId!: mongoose.Types.ObjectId | string;
  public studentId!: mongoose.Types.ObjectId | string;
  public chats!: {
    chatId: string;
    contact: mongoose.Types.ObjectId | string;
    contactModel: 'Teacher' | 'Student';
    lastMessage: string;
    timestamp: Date;
    unreadCount?: number;
  }[];

  constructor(data: Partial<Chatlist>) {
    Object.assign(this, {
      ...data,
      _id: data._id // Handle both _id and id for compatibility
    });
  }
}

export default Chatlist;