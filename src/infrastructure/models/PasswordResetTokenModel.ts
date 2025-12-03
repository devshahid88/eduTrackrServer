import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  token:    { type: String, required: true },
  expiresAt:{ type: Date,   required: true },
});

export default mongoose.model('PasswordResetToken', passwordResetSchema);
