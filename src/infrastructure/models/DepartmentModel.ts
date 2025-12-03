import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    code: string;
    establishedDate: Date;
    headOfDepartment: string;
    departmentEmail: string;
    departmentPhone: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

const DepartmentSchema: Schema = new Schema({
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
    establishedDate: {
        type: Date,
        required: true
    },
    headOfDepartment: {
        type: String,
        required: true
    },
    departmentEmail: {
        type: String,
        required: true,
        unique: true
    },
    departmentPhone: {
        type: String,
        required: true
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

export default mongoose.model<IDepartment>('Department', DepartmentSchema);

