import mongoose, { Schema, Document, ObjectId } from 'mongoose';

 interface IAdmin extends Document {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  profileImage: string;
  role: 'Admin';

  
}

const adminSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String },
  profileImage: { type: String },
  role: { type: String, enum: ['Admin'], default: 'Admin' }

});

const admintModel = mongoose.model<IAdmin>('Admin', adminSchema);

export default admintModel

