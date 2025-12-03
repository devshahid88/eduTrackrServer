import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduleDocument extends Document {
    _id: mongoose.Types.ObjectId;
    departmentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    day: string;
    startTime: string;
    endTime: string;
    semester: string;
    link: string;
    isLive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const ScheduleSchema: Schema = new Schema({
    departmentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Department', 
        required: true 
    },
    courseId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    teacherId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Teacher', 
        required: true 
    },
    day: { 
        type: String, 
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    startTime: { 
        type: String, 
        required: true 
    },
    endTime: { 
        type: String, 
        required: true 
    },
    semester: { 
        type: String, 
        required: true 
    },
    link: {
        type: String,
        default: ''
    },
    isLive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const ScheduleModel = mongoose.model<IScheduleDocument>('Schedule', ScheduleSchema);