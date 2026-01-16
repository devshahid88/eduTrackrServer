import Student from "../../domain/entities/Student";
import { IStudentDocument } from "../models/StudentModel";
import { Types } from "mongoose";

export class StudentMapper {
  static toDomain(data: IStudentDocument | any): Student {
    const defaultProfileImage = 'https://res.cloudinary.com/demo/image/upload/v1700000000/student_profiles/default-student.jpg';
    
    // Handle courses mapping
    const courses = Array.isArray(data.courses)
      ? data.courses.map((course: any) => {
          // If courseId is populated (object)
          if (course.courseId && typeof course.courseId === 'object') {
            return {
              courseId: course.courseId._id ? course.courseId._id.toString() : '',
              name: course.courseId.name || course.name,
              code: course.courseId.code || course.code,
              department: course.courseId.departmentId?.name || course.department,
            };
          }
          // If not populated or simple structure
          return {
            courseId: course.courseId?.toString() || course._id?.toString() || '',
            name: course.name || '',
            code: course.code || '',
            department: course.department || '',
          };
        })
      : [];

    const departmentId = data.department?._id?.toString() || 
                        (typeof data.department === 'string' ? data.department : '');
    const departmentName = data.department?.name || data.departmentName || '';

    return new Student({
      _id: data._id ? new Types.ObjectId(data._id) : undefined,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
      isBlock: data.isBlock,
      profileImage: data.profileImage && data.profileImage.trim() !== '' 
        ? data.profileImage 
        : defaultProfileImage,
      departmentId: departmentId,
      departmentName: departmentName,
      class: data.class,
      courses: courses,
      role: data.role,
    });
  }
}
