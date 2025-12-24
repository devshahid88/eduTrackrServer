import { Request, Response, NextFunction } from "express";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { ensureFullImageUrl } from "../middleware/multer";
import { isValidObjectId } from "mongoose";
import CourseModel from "../../infrastructure/models/CourseModel";
import DepartmentModel from "../../infrastructure/models/DepartmentModel";
import nodemailer from 'nodemailer';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { createHttpError } from "../../common/utils/createHttpError";

export class StudentController {
  constructor(private studentUseCase: StudentUseCase) {}

  async createStudentWithImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentData: any = {
        ...req.body,
        role: 'Student',
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      };

      if (!isValidObjectId(studentData.department)) {
        return next(createHttpError("Invalid department ID", HttpStatus.BAD_REQUEST));
      }

      const department = await DepartmentModel.findById(studentData.department);
      if (!department) {
        return next(createHttpError("Department not found", HttpStatus.BAD_REQUEST));
      }

      let courseIds: string[] = [];
      if (typeof studentData.courses === 'string') {
        try {
          courseIds = JSON.parse(studentData.courses);
        } catch {
          return next(createHttpError("Courses must be a valid JSON array", HttpStatus.BAD_REQUEST));
        }
      }

      if (courseIds.length > 0) {
        const courses = await CourseModel.find({ _id: { $in: courseIds } }).populate<{ departmentId: { name: string } }>('departmentId', 'name');
        if (courses.length !== courseIds.length) {
          return next(createHttpError("Some course IDs are invalid", HttpStatus.BAD_REQUEST));
        }

        studentData.courses = courses.map(course => ({
          courseId: course._id,
          name: course.name,
          code: course.code,
          department: course.departmentId.name
        }));
      } else {
        studentData.courses = [];
      }

      studentData.profileImage = req.file
        ? ensureFullImageUrl(req.file.path)
        : "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";

      const student = await this.studentUseCase.createStudent(studentData);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const subject = `Welcome to Our Platform, ${student.firstname}!`;
      const html = `
        <h2>Welcome, ${student.firstname} ${student.lastname}!</h2>
        <p>Thank you for joining as a ${student.role}.</p>
        <ul>
          <li>Email: ${student.email}</li>
          <li>Department: ${department.name}</li>
          <li>Class: ${student.class}</li>
        </ul>
        <p><a href="${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/auth/student-login">Login Here</a></p>
      `;

      try {
        await transporter.sendMail({
          from: `"EduApp" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject,
          html,
        });
      } catch (emailError: any) {
        console.warn("Email failed:", emailError.message);
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Student created successfully",
        data: this.formatStudentForResponse(student),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.params.id;
      if (!req.file) {
        return next(createHttpError("No image uploaded", HttpStatus.BAD_REQUEST));
      }

      const imageUrl = ensureFullImageUrl(req.file.path);
      const updated = await this.studentUseCase.updateStudent(studentId, { profileImage: imageUrl });

      if (!updated) {
        return next(createHttpError("Student not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Profile image updated",
        data: { profileImage: updated.profileImage, student: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return next(createHttpError("Invalid student ID", HttpStatus.BAD_REQUEST));
      }

      const student = await this.studentUseCase.getStudentById(id);
      if (!student) {
        return next(createHttpError("Student not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: this.formatStudentForResponse(student)
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return next(createHttpError("Invalid student ID", HttpStatus.BAD_REQUEST));
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

      if (updateData.department && isValidObjectId(updateData.department)) {
        const department = await DepartmentModel.findById(updateData.department);
        if (!department) {
          return next(createHttpError("Department not found", HttpStatus.BAD_REQUEST));
        }
      }

      let courseIds: string[] = [];
      if (typeof updateData.courses === 'string') {
        courseIds = JSON.parse(updateData.courses);
      } else if (Array.isArray(updateData.courses)) {
        courseIds = updateData.courses.map((c: any) => c?.courseId || c?._id || c).filter(Boolean);
      }

      if (courseIds.length > 0) {
        const courses = await CourseModel.find({ _id: { $in: courseIds } }).populate('departmentId', 'name');
        if (courses.length !== courseIds.length) {
          return next(createHttpError("One or more courses are invalid", HttpStatus.BAD_REQUEST));
        }
        updateData.courses = courses.map(course => ({
          courseId: course._id,
          name: course.name,
          code: course.code,
          department: (course.departmentId as any).name,
        }));
      }

      const student = await this.studentUseCase.updateStudent(id, updateData);
      if (!student) {
        return next(createHttpError("Student not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Student updated",
        data: this.formatStudentForResponse(student)
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return next(createHttpError("Invalid student ID", HttpStatus.BAD_REQUEST));
      }

      const deleted = await this.studentUseCase.deleteStudent(id);
      if (!deleted) {
        return next(createHttpError("Student not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({ success: true, message: "Student deleted" });
    } catch (error) {
      next(error);
    }
  }

  async getAllStudents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await this.studentUseCase.getAllStudents();
      console.log("Retrieved Students:", students);
      res.status(HttpStatus.OK).json({
        success: true,
        data: students.map(this.formatStudentForResponse),
      });
    } catch (error) {
      next(error);
    }
  }

  private formatStudentForResponse(student: any) {
    const formatted = { ...student };
    if (formatted.courses?.length) {
      formatted.courses = formatted.courses.map((course: any) => ({
        ...course,
        id: course.courseId || course._id || course.id,
        courseId: course.courseId || course._id || course.id,
        name: course.name,
        code: course.code,
        department: course.department,
      }));
    }

    if (typeof formatted.department === 'object') {
      formatted.departmentId = formatted.department._id;
      formatted.departmentName = formatted.department.name;
      formatted.department = formatted.department._id;
    }

    return formatted;
  }
}
