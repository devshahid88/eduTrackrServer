import { ScheduleModel, IScheduleDocument } from '../models/ScheduleModel';
import { IScheduleRepository } from '../../application/Interfaces/IScheduleRepository';
import Schedule from '../../domain/entities/Schedule';

export class ScheduleRepository implements IScheduleRepository {
    async createSchedule(schedule: Schedule): Promise<Schedule> {
        const scheduleDoc = new ScheduleModel(schedule);
        const savedDoc = await scheduleDoc.save();
        return new Schedule({
            ...savedDoc.toObject(),
            _id: savedDoc._id
        });
    }

    async findScheduleById(id: string): Promise<Schedule | null> {
        const doc = await ScheduleModel.findById(id)
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return doc ? new Schedule({ ...doc.toObject(), _id: doc._id }) : null;
    }

    async updateSchedule(id: string, scheduleData: Partial<Schedule>): Promise<Schedule | null> {
        const doc = await ScheduleModel.findByIdAndUpdate(
            id,
            scheduleData,
            { new: true }
        )
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return doc ? new Schedule({ ...doc.toObject(), _id: doc._id }) : null;
    }

    async deleteSchedule(id: string): Promise<boolean> {
        const result = await ScheduleModel.findByIdAndDelete(id);
        return !!result;
    }

    async getAllSchedules(): Promise<Schedule[]> {
        const docs = await ScheduleModel.find()
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule({ ...doc.toObject(), _id: doc._id }));
    }

    async getSchedulesByDepartment(departmentId: string): Promise<Schedule[]> {
        const docs = await ScheduleModel.find({ departmentId })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule({ ...doc.toObject(), _id: doc._id }));
    }

    async getSchedulesByTeacher(teacherId: string): Promise<Schedule[]> {
        const docs = await ScheduleModel.find({ teacherId })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule({ ...doc.toObject(), _id: doc._id }));
    }

    async findSchedulesByTeacherAndDay(teacherId: string, day: string): Promise<Schedule[]> {
        const docs = await ScheduleModel.find({ teacherId, day })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule({ ...doc.toObject(), _id: doc._id }));
    }
}