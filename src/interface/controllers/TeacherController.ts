import { Request, Response, NextFunction } from "express";
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { ensureFullImageUrl } from "../middleware/multer";
import nodemailer from 'nodemailer';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { createHttpError } from "../../common/utils/createHttpError";
import { isValidObjectId } from "mongoose";

export class TeacherController {
  constructor(private teacherUseCase: TeacherUseCase) {}

  async createTeacherWithImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    let emailError: any = null;
    try {
      const teacherData: any = {
        ...req.body,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        department: req.body.department,
        role: 'Teacher',
      };

      teacherData.profileImage = req.file
        ? ensureFullImageUrl(req.file.path)
        : "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";

      const teacher = await this.teacherUseCase.createTeacher(teacherData);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const subject = `Welcome to Our Platform, ${teacher.firstname}!`;
      const html = `
        <h2>Welcome, ${teacher.firstname} ${teacher.lastname}!</h2>
        <p>Thank you for joining our platform as a ${teacher.role}.</p>
        <ul>
          <li>Name: ${teacher.firstname} ${teacher.lastname}</li>
          <li>Email: ${teacher.email}</li>
          <li>Role: ${teacher.role}</li>
          <li>Department: ${teacher.department}</li>
        </ul>
        <a href="http://localhost:5173/auth/teacher-login">Login to your Teacher Dashboard</a>
      `;

      try {
        await transporter.sendMail({
          from: `"YourApp Team" <${process.env.EMAIL_USER}>`,
          to: teacher.email,
          subject,
          html,
        });
      } catch (error: any) {
        emailError = error;
        console.warn(`Failed to send email to ${teacher.email}: ${error.message}`);
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: emailError ? "Teacher created successfully, but email sending failed" : "Teacher created successfully",
        data: teacher,
      });
    } catch (error) {
      console.error("Create Teacher Error:", error);
      next(error);
    }
  }

  async updateProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.params.id;

      if (!req.file) {
        return next(createHttpError("No image uploaded", HttpStatus.BAD_REQUEST));
      }

      const profileImageUrl = ensureFullImageUrl(req.file.path);
      const updatedTeacher = await this.teacherUseCase.updateTeacher(teacherId, {
        profileImage: profileImageUrl,
      });

      if (!updatedTeacher) {
        return next(createHttpError("Teacher not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Profile image updated successfully",
        data: {
          profileImage: profileImageUrl,
          teacher: updatedTeacher,
        },
      });
    } catch (error) {
      console.error("Update Profile Image Error:", error);
      next(error);
    }
  }

  async findTeacherById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await this.teacherUseCase.findTeacherById(req.params.id);
      if (!teacher) {
        return next(createHttpError("Teacher not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      console.error("Find Teacher Error:", error);
      next(error);
    }
  }

  async updateTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.params.id;

      if (!teacherId || !isValidObjectId(teacherId)) {
        return next(createHttpError("Invalid teacher ID", HttpStatus.BAD_REQUEST));
      }

      const updateData = { ...req.body };

      if (updateData.password && !updateData.password.startsWith('$2')) {
        const bcrypt = require('bcrypt');
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      if (updateData.firstName) {
        updateData.firstname = updateData.firstName;
        delete updateData.firstName;
      }

      if (updateData.lastName) {
        updateData.lastname = updateData.lastName;
        delete updateData.lastName;
      }

      if (updateData.profileImage) {
        updateData.profileImage = ensureFullImageUrl(updateData.profileImage);
      }

      const updatedTeacher = await this.teacherUseCase.updateTeacher(teacherId, updateData);
      if (!updatedTeacher) {
        return next(createHttpError("Teacher not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Teacher updated successfully",
        data: updatedTeacher,
      });
    } catch (error) {
      console.error("Update Teacher Error:", error);
      next(error);
    }
  }

  async deleteTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await this.teacherUseCase.deleteTeacher(req.params.id);
      if (!deleted) {
        return next(createHttpError("Teacher not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (error) {
      console.error("Delete Teacher Error:", error);
      next(error);
    }
  }

  async getAllTeachers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teachers = await this.teacherUseCase.getAllTeachers();
      console.log("Get All Teachers:", teachers);
      res.status(HttpStatus.OK).json({
        success: true,
        data: teachers,
      });
    } catch (error) {
      console.error("Get All Teachers Error:", error);
      next(error);
    }
  }
}
