import { IScheduleRepository } from '../../application/Interfaces/IScheduleRepository';
import Schedule from '../../domain/entities/Schedule';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class ScheduleUseCase {
    constructor(private scheduleRepository: IScheduleRepository) {}

    async createSchedule(scheduleData: Partial<Schedule>): Promise<Schedule> {
        if (
            !this.isValidTimeFormat(scheduleData.startTime) ||
            !this.isValidTimeFormat(scheduleData.endTime)
        ) {
            throw createHttpError('Invalid time format (HH:MM required)', HttpStatus.BAD_REQUEST);
        }

        if (!this.isValidTimeRange(scheduleData.startTime, scheduleData.endTime)) {
            throw createHttpError('End time must be after start time', HttpStatus.BAD_REQUEST);
        }

        const conflict = await this.checkTimeConflicts(scheduleData);
        if (conflict) {
            throw createHttpError(
                `Time slot conflicts with existing schedule for teacher ${conflict.teacherId.toString()} on ${conflict.day} from ${conflict.startTime} to ${conflict.endTime}`,
                HttpStatus.CONFLICT
            );
        }

        return await this.scheduleRepository.createSchedule(new Schedule(scheduleData));
    }

    async findScheduleById(id: string): Promise<Schedule | null> {
        return await this.scheduleRepository.findScheduleById(id);
    }

    async updateSchedule(id: string, updateData: Partial<Schedule>): Promise<Schedule | null> {
        if (updateData.startTime && !this.isValidTimeFormat(updateData.startTime)) {
            throw createHttpError('Invalid start time format (HH:MM required)', HttpStatus.BAD_REQUEST);
        }

        if (updateData.endTime && !this.isValidTimeFormat(updateData.endTime)) {
            throw createHttpError('Invalid end time format (HH:MM required)', HttpStatus.BAD_REQUEST);
        }

        if (updateData.startTime && updateData.endTime && 
            !this.isValidTimeRange(updateData.startTime, updateData.endTime)) {
            throw createHttpError('End time must be after start time', HttpStatus.BAD_REQUEST);
        }

        const conflict = await this.checkTimeConflicts(updateData, id);
        if (conflict) {
            throw createHttpError(
                `Time slot conflicts with existing schedule for teacher ${conflict.teacherId.toString()} on ${conflict.day} from ${conflict.startTime} to ${conflict.endTime}`,
                HttpStatus.CONFLICT
            );
        }

        return await this.scheduleRepository.updateSchedule(id, updateData);
    }

    async deleteSchedule(id: string): Promise<boolean> {
        return await this.scheduleRepository.deleteSchedule(id);
    }

    async getAllSchedules(): Promise<Schedule[]> {
        return await this.scheduleRepository.getAllSchedules();
    }

    async getSchedulesByDepartment(departmentId: string): Promise<Schedule[]> {
        return await this.scheduleRepository.getSchedulesByDepartment(departmentId);
    }

    async getSchedulesByTeacher(teacherId: string): Promise<Schedule[]> {
        return await this.scheduleRepository.getSchedulesByTeacher(teacherId);
    }

    async startLiveClass(scheduleId: string): Promise<Schedule | null> {
        return await this.scheduleRepository.updateSchedule(scheduleId, { isLive: true });
    }

    async stopLiveClass(scheduleId: string): Promise<Schedule | null> {
        return await this.scheduleRepository.updateSchedule(scheduleId, { isLive: false });
    }

    private isValidTimeFormat(time: string | undefined): boolean {
        if (!time) return false;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    private isValidTimeRange(startTime: string | undefined, endTime: string | undefined): boolean {
        if (!startTime || !endTime) return true;
        const startMinutes = this.toMinutes(startTime);
        const endMinutes = this.toMinutes(endTime);
        return endMinutes > startMinutes;
    }

    private toMinutes(time: string): number {
        const [hour, minute] = time.trim().split(':').map(Number);
        return hour * 60 + minute;
    }

    private async checkTimeConflicts(
        scheduleData: Partial<Schedule>,
        excludeId?: string
    ): Promise<Schedule | false> {
        const { day, startTime, endTime, teacherId } = scheduleData;
        
        if (!day || !startTime || !endTime || !teacherId) {
            return false;
        }

        const existingSchedules = await this.scheduleRepository.findSchedulesByTeacherAndDay(
            teacherId.toString(),
            day
        );

        const newStart = this.toMinutes(startTime);
        const newEnd = this.toMinutes(endTime);

        for (const schedule of existingSchedules) {
            if (excludeId && schedule._id?.toString() === excludeId) {
                continue;
            }

            const existingStart = this.toMinutes(schedule.startTime);
            const existingEnd = this.toMinutes(schedule.endTime);

            const hasOverlap = 
                (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd);

            if (hasOverlap) {
                return schedule; // Return the conflicting schedule for detailed error message
            }
        }

        return false;
    }
}