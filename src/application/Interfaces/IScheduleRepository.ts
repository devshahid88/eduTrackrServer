import Schedule from '../../domain/entities/Schedule';

export interface IScheduleRepository {
    createSchedule(schedule: Schedule): Promise<Schedule>;
    findScheduleById(id: string): Promise<Schedule | null>;
    updateSchedule(id: string, scheduleData: Partial<Schedule>): Promise<Schedule | null>;
    deleteSchedule(id: string): Promise<boolean>;
    getAllSchedules(): Promise<Schedule[]>;
    getSchedulesByDepartment(departmentId: string): Promise<Schedule[]>;
    getSchedulesByTeacher(teacherId: string): Promise<Schedule[]>;
    findSchedulesByTeacherAndDay(teacherId: string, day: string): Promise<Schedule[]>;
}