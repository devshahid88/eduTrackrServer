import { Request, Response, NextFunction } from "express";
import { CourseUseCase } from "../../application/useCases/CourseUseCase";
import { isValidObjectId } from "mongoose";
import { HttpStatus } from '../../common/enums/http-status.enum';

export class CourseController {
  constructor(private courseUseCase: CourseUseCase) {}

  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await this.courseUseCase.createCourse(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Course created successfully",
        data: course
      });
    } catch (error: any) {
      console.error("Create course error:", error);
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid course ID" });
        return;
      }

      const course = await this.courseUseCase.getCourseById(id);
      if (!course) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Course not found" });
        return;
      }

      res.status(HttpStatus.OK).json({ success: true, data: course });
    } catch (error: any) {
      console.error("Get course error:", error);
      next(error);
    }
  }

  async getCoursesByDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId } = req.params;
      if (!isValidObjectId(departmentId)) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid department ID" });
        return;
      }

      const courses = await this.courseUseCase.getCoursesByDepartment(departmentId);
      res.status(HttpStatus.OK).json({ success: true, data: courses });
    } catch (error: any) {
      console.error("Get courses by department error:", error);
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid course ID" });
        return;
      }

      const course = await this.courseUseCase.updateCourse(id, req.body);
      if (!course) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Course not found" });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Course updated successfully",
        data: course
      });
    } catch (error: any) {
      console.error("Update course error:", error);
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid course ID" });
        return;
      }

      const deleted = await this.courseUseCase.deleteCourse(id);
      if (!deleted) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Course not found" });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Course deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete course error:", error);
      next(error);
    }
  }

  async getAllCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await this.courseUseCase.getAllCourses();
      res.status(HttpStatus.OK).json({ success: true, data: courses });
    } catch (error: any) {
      console.error("Get all courses error:", error);
      next(error);
    }
  }
}
