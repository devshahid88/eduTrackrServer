import { Course } from "../../domain/entities/Course";
import { ICourseDocument } from "../models/CourseModel";

export class CourseMapper {
  static toDomain(raw: any | ICourseDocument): Course {
    // Handle population: departmentId might be an ID or an Object with 'name'
    const deptId = raw.departmentId?._id 
        ? raw.departmentId._id.toString() 
        : raw.departmentId?.toString();
        
    const deptName = raw.departmentId?.name || undefined;

    return Course.create({
      _id: raw._id.toString(),
      name: raw.name,
      code: raw.code,
      semester: raw.semester,
      departmentId: deptId,
      departmentName: deptName,
      active: raw.active,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }
}
