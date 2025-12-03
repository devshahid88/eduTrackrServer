import { IStudentRepository } from "../../application/Interfaces/IStudent";
import Student from "../../domain/entities/Student";
import studentModel from "../models/StudentModel";
import { Types } from "mongoose";

// Map function to convert MongoDB document to Student entity
export const mapToStudentEntity = (data: any): Student => {
  const defaultProfileImage = 'https://res.cloudinary.com/demo/image/upload/v1700000000/student_profiles/default-student.jpg';
  const courses = Array.isArray(data.courses)
    ? data.courses.map((course: any) => {
        if (course.courseId && typeof course.courseId === 'object') {
          return {
            courseId: course.courseId._id.toString(),
            name: course.courseId.name || course.name,
            code: course.courseId.code || course.code,
            department: course.courseId.departmentId?.name || course.department,
          };
        }
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
  const departmentName = data.department?.name || '';

  return new Student({
    _id: data._id as Types.ObjectId,
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
};

export class StudentRepository implements IStudentRepository {
  async createStudent(student: Student): Promise<Student> {
    const newStudent = new studentModel(student);
    const savedStudent = await newStudent.save();
    const populatedStudent = await savedStudent.populate('department', 'name');
    return mapToStudentEntity(populatedStudent.toObject());
  }

  async findStudentById(id: string): Promise<Student | null> {
    const student = await studentModel
      .findById(id)
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name',
        },
      });
    return student ? mapToStudentEntity(student.toObject()) : null;
  }

  async findStudentByEmail(email: string): Promise<Student | null> {
    const student = await studentModel
      .findOne({ email })
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name',
        },
      });
    return student ? mapToStudentEntity(student.toObject()) : null;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student | null> {
    const updated = await studentModel
      .findByIdAndUpdate(id, student, { new: true })
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name',
        },
      });
    return updated ? mapToStudentEntity(updated.toObject()) : null;
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await studentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await studentModel
      .find()
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name',
        },
      });
    return students.map((student) => mapToStudentEntity(student.toObject()));
  }

  async searchUsers(searchTerm: string, role: string = 'Student'): Promise<Student[]> {
    const query: any = {
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    if (role !== 'All') {
      query.role = role;
    }

    const students = await studentModel
      .find(query)
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name',
        },
      })
      .lean();
    return students.map((student) => mapToStudentEntity(student));
  }
}