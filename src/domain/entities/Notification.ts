export class Notification {
  constructor(
    public userId: string,
    public userModel: 'Teacher' | 'Student' | 'Admin',
    public type: 'message' | 'media' | 'reaction' | 'reply' | 'assignment' | 'grade' | 'system' | 'announcement',
    public title: string,
    public message: string,
    public read: boolean = false,
    public timestamp: Date = new Date(),
    public sender?: string,
    public senderModel?: 'Teacher' | 'Student' | 'Admin',
    public role?: 'Teacher' | 'Student' | 'Admin',
    public data?: {
      chatId?: string;
      messageId?: string;
      sender?: string;
      senderModel?: 'Teacher' | 'Student';
    },
    public _id?: string
  ) {}

  static create(data: Partial<Notification>): Notification {
    return new Notification(
      data.userId || '',
      data.userModel || 'Student',
      data.type || 'system',
      data.title || '',
      data.message || '',
      data.read ?? false,
      data.timestamp || new Date(),
      data.sender,
      data.senderModel,
      data.role,
      data.data,
      data._id
    );
  }
}
