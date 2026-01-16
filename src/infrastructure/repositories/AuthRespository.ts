import { IAuthRepository } from "../../application/Interfaces/IAuthRepository";
import Student from "../../domain/entities/Student";
import Admin from "../../domain/entities/Admin";
import Teacher from "../../domain/entities/Teacher";

import studentModel from "../models/StudentModel";
import adminModel from "../models/AdminModel";
import teacherModel from "../models/TeacherModel";
import tokenModel from "../models/PasswordResetTokenModel";

import { StudentMapper } from "../mappers/StudentMapper";
import { AdminMapper } from "../mappers/AdminMapper";
import { TeacherMapper } from "../mappers/TeacherMapper";

import { ILogger } from "../../application/Interfaces/ILogger";

export class AuthRepository implements IAuthRepository {
  constructor(private logger: ILogger) {}
  
  async findStudentByEmail(email: string): Promise<Student | null> {
    const studentDoc = await studentModel.findOne({ email }).populate("department", "name").lean();
    return studentDoc ? StudentMapper.toDomain(studentDoc) : null;
  }

  async findAdminByEmail(email: string): Promise<Admin | null> {
    const adminDoc = await adminModel.findOne({ email }).lean();
    return adminDoc ? AdminMapper.toDomain(adminDoc) : null;
  }

  async findTeacherByEmail(email: string): Promise<Teacher | null> {
    const teacherDoc = await teacherModel.findOne({ email }).populate("department", "name code").lean();
    return teacherDoc ? TeacherMapper.toDomain(teacherDoc) : null;
  }

  async updatePasswordByEmail(email: string, newPassword: string): Promise<boolean> {
    const updated =
      (await studentModel.findOneAndUpdate({ email }, { password: newPassword })) ||
      (await teacherModel.findOneAndUpdate({ email }, { password: newPassword })) ||
      (await adminModel.findOneAndUpdate({ email }, { password: newPassword }));

    return !!updated;
  }

  async saveResetTokenByEmail(email: string, token: string, expiresAt: Date): Promise<void> {
    // upsert: true creates if not exists
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
