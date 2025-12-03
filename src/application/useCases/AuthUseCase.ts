import bcrypt from "bcrypt";
import crypto from 'crypto';
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import { TokenService } from '../../infrastructure/services/TokenService';
import { IAuthRepository } from "../Interfaces/IAuthRepository";
import { HttpStatus } from '../../common/enums/http-status.enum';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpMessage } from '../../common/enums/http-message.enum';

dotenv.config();

export class AuthUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async loginStudent(email: string, password: string) {
    if (!email) {
      createHttpError(HttpMessage.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const student = await this.authRepository.findStudentByEmail(email);
    if (!student) {
      createHttpError(HttpMessage.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = student.password.startsWith('$2')
      ? await bcrypt.compare(password, student.password)
      : password === student.password;

    if (!isPasswordValid) {
      createHttpError(HttpMessage.PASSWORD_INCORRECT, HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      id: student._id,
      email: student.email,
      role: student.role,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    const safeStudent = {
      id: student._id,
      username: student.username,
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      isBlock: student.isBlock,
      profileImage: student.profileImage || null,
      departmentId: student.departmentId,
      departmentName: student.departmentName || '',
      class: student.class,
      courses: student.courses,
      role: student.role,
    };

    return {
      student: safeStudent,
      accessToken,
      refreshToken,
    };
  }

  async loginAdmin(email: string, password: string) {
    if (!email) {
      createHttpError(HttpMessage.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const admin = await this.authRepository.findAdminByEmail(email);
    if (!admin) {
      createHttpError(HttpMessage.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = admin.password.startsWith('$2')
      ? await bcrypt.compare(password, admin.password)
      : password === admin.password;

    if (!isPasswordValid) {
      createHttpError(HttpMessage.PASSWORD_INCORRECT, HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    const safeAdmin = {
      id: admin.id,
      username: admin.username,
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      profileImage: admin.profileImage,
      role: admin.role,
    };

    return {
      admin: safeAdmin,
      accessToken,
      refreshToken,
    };
  }

  async loginTeacher(email: string, password: string) {
    if (!email) {
      createHttpError(HttpMessage.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const teacher = await this.authRepository.findTeacherByEmail(email);
    if (!teacher) {
      createHttpError(HttpMessage.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = teacher.password.startsWith('$2')
      ? await bcrypt.compare(password, teacher.password)
      : password === teacher.password;

    if (!isPasswordValid) {
      createHttpError(HttpMessage.PASSWORD_INCORRECT, HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      id: teacher.id,
      email: teacher.email,
      role: teacher.role,
    };

    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    const safeTeacher = {
      id: teacher.id,
      username: teacher.username,
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      email: teacher.email,
      departmentId: teacher.department,
      departmentName: teacher.departmentName || '',
      profileImage: teacher.profileImage,
      role: teacher.role,
    };

    return {
      teacher: safeTeacher,
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string) {
    if (!email) createHttpError(HttpMessage.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);

    const user = await this.findUserAcrossAll(email);
    if (!user) createHttpError(HttpMessage.USER_NOT_FOUND, HttpStatus.NOT_FOUND);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.authRepository.saveResetTokenByEmail(email, token, expiresAt);

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Reset Link',
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to set a new one (valid for 1 hour):</p>
        <p><a href="${resetLink}">Reset your password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Thanks,<br/>Your App Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset URL → http://localhost:5173/auth/reset-password/${token}`);

    return { success: true, token, message: HttpMessage.RESET_SENT };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    if (!email || !token || !newPassword) {
      createHttpError(HttpMessage.PASSWORD_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const valid = await this.authRepository.validateResetToken(email, token);
    if (!valid) createHttpError(HttpMessage.INVALID_OR_EXPIRED_TOKEN, HttpStatus.UNAUTHORIZED);

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await this.authRepository.updatePasswordByEmail(email, hashed);
    if (!updated) createHttpError('Password reset failed', HttpStatus.INTERNAL_SERVER_ERROR);

    await this.authRepository.clearResetToken(email);
    return { success: true, message: HttpMessage.RESET_SUCCESS };
  }

  private async findUserAcrossAll(email: string) {
    const student = await this.authRepository.findStudentByEmail(email);
    if (student) return student;
    const teacher = await this.authRepository.findTeacherByEmail(email);
    if (teacher) return teacher;
    const admin = await this.authRepository.findAdminByEmail(email);
    if (admin) return admin;
    return null;
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = TokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      createHttpError(HttpMessage.INVALID_OR_EXPIRED_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    const newAccessToken = TokenService.generateAccessToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken: newAccessToken };
  }
}
