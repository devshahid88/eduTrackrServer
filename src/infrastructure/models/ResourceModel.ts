import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
  courseId: mongoose.Types.ObjectId;
  role: 'Teacher' | 'Student' | 'Admin';
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'video', 'link'], required: true },
  url: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: false }, // Optional, as resources might be general
  role: { type: String, enum: ['Teacher', 'Student', 'Admin'], required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ResourceModel = mongoose.model<IResource>('Resource', ResourceSchema);
