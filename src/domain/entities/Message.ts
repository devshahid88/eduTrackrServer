import mongoose from 'mongoose';

export class MessageEntity {
  public id!: string;
  public chatId!: string;
  public sender!: mongoose.Types.ObjectId | string;
  public senderModel!: 'Teacher' | 'Student';
  public receiver!: mongoose.Types.ObjectId | string;
  public receiverModel!: 'Teacher' | 'Student';
  public message?: string;
  public mediaUrl?: string;
  public mediaType?: string;
  public replyTo?: mongoose.Types.ObjectId | string;
  public reactions?: { user: mongoose.Types.ObjectId | string; reaction: string }[];
  public timestamp!: Date;
  public isDeleted?: boolean;

  constructor(data: Partial<MessageEntity>) {
    Object.assign(this, data);
  }
}

export default MessageEntity;