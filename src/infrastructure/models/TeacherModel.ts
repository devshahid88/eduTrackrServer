import mongoose, { Schema, Document } from 'mongoose';

interface ITeacher extends Document {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  profileImage?: string;
  department: mongoose.Types.ObjectId;
  role: 'Teacher';
}

const TeacherSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String },
  profileImage: { type: String },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  role: { type: String, enum: ['Teacher'], default: 'Teacher' }
});
const teacherModel = mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default teacherModel;
