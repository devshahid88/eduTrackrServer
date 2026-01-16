import Schedule from '../../domain/entities/Schedule';
import { IScheduleDocument } from '../models/ScheduleModel';

export class ScheduleMapper {
  static toDomain(raw: any | IScheduleDocument): Schedule {
    // Check if fields are populated (have name/username) or are just IDs
    const deptId = raw.departmentId?._id || raw.departmentId;
    const deptName = raw.departmentId?.name;

    const courseId = raw.courseId?._id || raw.courseId;
    const courseName = raw.courseId?.name;
    const courseCode = raw.courseId?.code;

    const teacherId = raw.teacherId?._id || raw.teacherId;
    // Teacher usually has 'name' or 'username' or 'firstname' + 'lastname'
    // Let's assume username or try firstname + lastname
    const teacherName = raw.teacherId?.username || 
                        (raw.teacherId?.firstname ? `${raw.teacherId.firstname} ${raw.teacherId.lastname || ''}`.trim() : undefined);

    return new Schedule({
      _id: raw._id,
      departmentId: deptId,
      departmentName: deptName,
      courseId: courseId,
      courseName: courseName,
      courseCode: courseCode,
      teacherId: teacherId,
      teacherName: teacherName,
      day: raw.day,
      startTime: raw.startTime,
      endTime: raw.endTime,
      semester: raw.semester,
      link: raw.link,
      isLive: raw.isLive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }
}
