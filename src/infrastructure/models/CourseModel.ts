import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICourse extends Document {
    name: string;
    code: string;
    departmentId: Types.ObjectId;
    semester: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

const CourseSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model<ICourse>('Course', CourseSchema);

