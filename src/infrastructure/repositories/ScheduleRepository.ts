import { ScheduleModel, IScheduleDocument } from '../models/ScheduleModel';
import { IScheduleRepository } from '../../application/Interfaces/IScheduleRepository';
import Schedule from '../../domain/entities/Schedule';
import { BaseRepository } from "./BaseRepository";
import { ScheduleMapper } from "../mappers/ScheduleMapper";

import { ILogger } from '../../application/Interfaces/ILogger';

export class ScheduleRepository extends BaseRepository<Schedule, IScheduleDocument> implements IScheduleRepository {
    
    constructor(private logger: ILogger) {
        super(ScheduleModel);
    }

    protected toEntity(model: IScheduleDocument): Schedule {
        return ScheduleMapper.toDomain(model);
    }

    async createSchedule(schedule: Schedule): Promise<Schedule> {
        return this.create(schedule);
    }

    async findScheduleById(id: string): Promise<Schedule | null> {
        const doc = await this._model.findById(id)
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return doc ? this.toEntity(doc) : null;
    }

    async updateSchedule(id: string, scheduleData: Partial<Schedule>): Promise<Schedule | null> {
        return this.update(id, scheduleData);
    }

    async deleteSchedule(id: string): Promise<boolean> {
        return this.delete(id);
    }

    async getAllSchedules(): Promise<Schedule[]> {
        const docs = await this._model.find()
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => this.toEntity(doc));
    }

    async getSchedulesByDepartment(departmentId: string): Promise<Schedule[]> {
        const docs = await this._model.find({ departmentId })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => this.toEntity(doc));
    }

    async getSchedulesByTeacher(teacherId: string): Promise<Schedule[]> {
        const docs = await this._model.find({ teacherId })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => this.toEntity(doc));
    }

    async findSchedulesByTeacherAndDay(teacherId: string, day: string): Promise<Schedule[]> {
        const docs = await this._model.find({ teacherId, day })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => this.toEntity(doc));
    }
}
