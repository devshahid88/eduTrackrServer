import mongoose, { Schema, Document } from 'mongoose';

export type ConcernStatus = 'pending' | 'in_progress' | 'solved' | 'rejected';

export interface IConcern extends Document {
  title: string;
  description: string;
  status: ConcernStatus;
  feedback?: string;
  createdBy: mongoose.Types.ObjectId;
  createdByRole: 'Student' | 'Teacher';
  createdAt: Date;
  updatedAt: Date;
}

const ConcernSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'solved', 'rejected'], default: 'pending' },
  feedback: { type: String },
  createdBy: { type: Schema.Types.ObjectId, required: true, refPath: 'createdByRole' },
  createdByRole: { type: String, enum: ['Student', 'Teacher'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ConcernModel = mongoose.model<IConcern>('Concern', ConcernSchema);
export default ConcernModel; 