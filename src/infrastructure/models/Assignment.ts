// models/Assignment.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

interface ISubmissionContent {
  text: string;
  files: string[];
}

interface ISubmission {
  _id?: Types.ObjectId;
  studentId: Types.ObjectId;
  studentName: string;
  submittedAt: Date;
  isLate: boolean;
  submissionContent: ISubmissionContent;
  grade?: number;
  feedback?: string;
}

interface IAssignmentDocument extends Document {
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxMarks: number;
  courseId: Types.ObjectId;
  departmentId: Types.ObjectId;
  teacherId: Types.ObjectId;
  attachments?: string[];
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
  submissionFormat?: string;
  isGroupAssignment?: boolean;
  maxGroupSize?: number;
  status: string;
  submissions: ISubmission[];
  totalStudents?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubmissionContentSchema = new Schema({
  text: { type: String, default: '' },
  files: [{ type: String }]
}, { _id: false });

const SubmissionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  submissionContent: { type: SubmissionContentSchema, required: true },
  grade: { type: Number },
  feedback: { type: String }
});

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: { type: String },
  dueDate: { type: Date, required: true },
  maxMarks: { type: Number, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  attachments: [{ type: String, required: false }],
  allowLateSubmission: { type: Boolean, default: false },
  lateSubmissionPenalty: { type: Number, default: 0 },
  submissionFormat: { type: String },
  isGroupAssignment: { type: Boolean, default: false },
  maxGroupSize: { type: Number, default: 1 },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'active'], default: 'active' },
  submissions: [SubmissionSchema],
  totalStudents: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IAssignmentDocument>('Assignment', AssignmentSchema);