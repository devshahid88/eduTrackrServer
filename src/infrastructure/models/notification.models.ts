import mongoose, { Schema } from 'mongoose';

export interface INotification {
  _id: string;
  userId: mongoose.Types.ObjectId;
  userModel: 'Teacher' | 'Student';
  type: 'message' | 'media' | 'reaction' | 'reply' | 'assignment' | 'grade' | 'system';
  title: string;
  message: string;
  read: boolean;
  sender?: string;
  senderModel?: 'Teacher' | 'Student';
  role?: 'Teacher' | 'Student';
  data?: {
    chatId?: string;
    messageId?: string;
    sender?: string;
    senderModel?: 'Teacher' | 'Student';
  };
  timestamp: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, required: true, refPath: 'userModel' },
  userModel: { type: String, enum: ['Teacher', 'Student'], required: true },
  type: { type: String, enum: ['message', 'media', 'reaction', 'reply', 'assignment', 'grade', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  sender: { type: String },
  senderModel: { type: String, enum: ['Teacher', 'Student'] },
  role: { type: String, enum: ['Teacher', 'Student'] },
  data: {
    chatId: String,
    messageId: String,
    sender: String,
    senderModel: String
  },
  timestamp: { type: Date, default: Date.now }
});

// Add indexes for better query performance
NotificationSchema.index({ userId: 1, userModel: 1 });
NotificationSchema.index({ timestamp: -1 });
NotificationSchema.index({ read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema); 