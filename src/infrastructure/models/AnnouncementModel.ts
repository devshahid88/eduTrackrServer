import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  targetRoles: ('Teacher' | 'Student' | 'Admin')[];
  courseId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRoles: [{ type: String, enum: ['Teacher', 'Student', 'Admin'], required: true }],
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const AnnouncementModel = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
