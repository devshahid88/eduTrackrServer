// src/infrastructure/database/mongodb/models/studentModel.ts

import mongoose, { Schema, Document } from 'mongoose';

interface ICourse {
  courseId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  department: string;
}

interface IStudent extends Document {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  isBlock: boolean;
  profileImage?: string;
  department: mongoose.Types.ObjectId;
  departmentName?: string;
  class: string;
  courses: ICourse[];
  role: 'Student';
}

const StudentSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String },
  isBlock: { type: Boolean, default: false },
  profileImage: { type: String },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  class: { type: String, required: true },
  courses: [
    {
      courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
      name: { type: String, required: true },
      code: { type: String, required: true },
      department: { type: String, required: true }
    }
  ],
  role: { type: String, enum: ['Student'], default: 'Student' }
});

const studentModel = mongoose.model<IStudent>('Student', StudentSchema);

export default studentModel;
