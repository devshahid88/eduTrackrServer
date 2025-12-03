// src/domain/entities/Student.ts
import { Types } from 'mongoose'; // ✅ important

// Course data for a student: use courseId and metadata
interface Course {
  courseId: string;
  name: string;
  code: string;
  department: string;
}

// Student domain entity
class Student {
  public readonly _id?: Types.ObjectId; // ✅ ObjectId
  public username: string;
  public firstname: string;
  public lastname: string;
  public email: string;
  public password: string;
  public isBlock: boolean;
  public profileImage?: string;
  public departmentId: string;       // Department reference
  public departmentName?: string;    // Populated department name
  public class: string;
  public courses: Course[];          // Enrolled courses
  public role: 'Student';

  constructor(data: Partial<Student>) {
    this._id = data._id;
    this.username = data.username ?? '';
    this.firstname = data.firstname ?? '';
    this.lastname = data.lastname ?? '';
    this.email = data.email ?? '';
    this.password = data.password ?? '';
    this.isBlock = data.isBlock ?? false;
    this.profileImage = data.profileImage;
    this.departmentId = data.departmentId ?? '';
    this.departmentName = data.departmentName;
    this.class = data.class ?? '';
    this.courses = data.courses ?? [];
    this.role = 'Student';
  }
}

export default Student;
