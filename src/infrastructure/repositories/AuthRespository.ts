import { Types } from "mongoose";
import { IAuthRepository } from "../../application/Interfaces/IAuthRepository";
import Student from "../../domain/entities/Student";
import Admin from "../../domain/entities/Admin";
import Teacher from "../../domain/entities/Teacher";

import studentModel from "../models/StudentModel";
import adminModel from "../models/AdminModel";
import teacherModel from "../models/TeacherModel";
import tokenModel from "../models/PasswordResetTokenModel";

import { DEFAULT_PROFILE_IMAGE, ensureFullImageUrl } from "../../interface/middleware/multer";

export class AuthRepository implements IAuthRepository {
  private toStudentEntity(doc: any): Student {
    let departmentId = "";
    let departmentName = "";

    if (doc.department && typeof doc.department === "object" && "_id" in doc.department) {
      departmentId = doc.department._id.toString();
      departmentName = doc.department.name || "";
    } else if (typeof doc.department === "string" || doc.department instanceof Types.ObjectId) {
      departmentId = doc.department.toString();
    }

    const courses = Array.isArray(doc.courses)
      ? doc.courses.map((course: any) => ({
          courseId: course.courseId?.toString(),
          name: course.name,
          code: course.code,
          department: course.department,
        }))
      : [];

    return new Student({
      _id: doc._id,
      username: doc.username,
      email: doc.email,
      firstname: doc.firstname,
      lastname: doc.lastname,
      password: doc.password,
      isBlock: doc.isBlock,
      profileImage: doc.profileImage,
      departmentId,
      departmentName,
      class: doc.class,
      courses,
      role: "Student",
    });
  }

  private toAdminEntity(doc: any): Admin {
    return new Admin({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      firstname: doc.firstname,
      lastname: doc.lastname,
      password: doc.password,
      profileImage: doc.profileImage,
      role: "Admin",
    });
  }

  private toTeacherEntity(doc: any): Teacher {
    const departmentId =
      doc.department?._id?.toString() || (typeof doc.department === "string" ? doc.department : "");
    const departmentName = doc.department?.name || "";

    let profileImage = DEFAULT_PROFILE_IMAGE;
    if (typeof doc.profileImage === "string" && doc.profileImage.trim() !== "") {
      profileImage = doc.profileImage.startsWith("http")
        ? doc.profileImage
        : ensureFullImageUrl(doc.profileImage);
    }

    return new Teacher({
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      firstname: doc.firstname,
      lastname: doc.lastname,
      password: doc.password,
      profileImage,
      department: departmentId,
      departmentName,
      role: "Teacher",
    });
  }

  async findStudentByEmail(email: string): Promise<Student | null> {
    const studentDoc = await studentModel.findOne({ email }).populate("department", "name").lean();
    return studentDoc ? this.toStudentEntity(studentDoc) : null;
  }

  async findAdminByEmail(email: string): Promise<Admin | null> {
    const adminDoc = await adminModel.findOne({ email }).lean();
    return adminDoc ? this.toAdminEntity(adminDoc) : null;
  }

  async findTeacherByEmail(email: string): Promise<Teacher | null> {
    const teacherDoc = await teacherModel.findOne({ email }).populate("department", "name code").lean();
    return teacherDoc ? this.toTeacherEntity(teacherDoc) : null;
  }

  async updatePasswordByEmail(email: string, newPassword: string): Promise<boolean> {
    const updated =
      (await studentModel.findOneAndUpdate({ email }, { password: newPassword })) ||
      (await teacherModel.findOneAndUpdate({ email }, { password: newPassword })) ||
      (await adminModel.findOneAndUpdate({ email }, { password: newPassword }));

    return !!updated;
  }

  async saveResetTokenByEmail(email: string, token: string, expiresAt: Date): Promise<void> {
    await tokenModel.findOneAndUpdate({ email }, { token, expiresAt }, { upsert: true });
  }

  async validateResetToken(email: string, token: string): Promise<boolean> {
    const record = await tokenModel.findOne({ email, token });
    return !!record && record.expiresAt > new Date();
  }

  async clearResetToken(email: string): Promise<void> {
    await tokenModel.deleteOne({ email });
  }
}
