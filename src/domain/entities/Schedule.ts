import mongoose from 'mongoose';

export class Schedule {
    public readonly _id?: mongoose.Types.ObjectId;
    public departmentId!: mongoose.Types.ObjectId;
    public departmentName?: string;
    public courseId!: mongoose.Types.ObjectId;
    public courseName?: string;
    public courseCode?: string;
    public teacherId!: mongoose.Types.ObjectId;
    public teacherName?: string;
    public day!: string;
    public startTime!: string;
    public endTime!: string;
    public semester!: string;
    public link!: string;
    public isLive?: boolean;
    public createdAt?: Date;
    public updatedAt?: Date;

    constructor(data: Partial<Schedule>) {
        this._id = data._id;
        this.departmentId = data.departmentId ?? new mongoose.Types.ObjectId();
        this.departmentName = data.departmentName;
        this.courseId = data.courseId ?? new mongoose.Types.ObjectId();
        this.courseName = data.courseName;
        this.courseCode = data.courseCode;
        this.teacherId = data.teacherId ?? new mongoose.Types.ObjectId();
        this.teacherName = data.teacherName;
        this.day = data.day ?? '';
        this.startTime = data.startTime ?? '';
        this.endTime = data.endTime ?? '';
        this.semester = data.semester ?? '';
        this.link = data.link ?? '';
        this.isLive = data.isLive ?? false;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}

export default Schedule;