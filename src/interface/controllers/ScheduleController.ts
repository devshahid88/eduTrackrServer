import { Request, Response, NextFunction } from "express";
import { ScheduleUseCase } from "../../application/useCases/ScheduleUseCase";
import { isValidObjectId } from "mongoose";
import { HttpStatus } from '../../common/enums/http-status.enum';
import { createHttpError } from '../../common/utils/createHttpError';

export class ScheduleController {
  constructor(private scheduleUseCase: ScheduleUseCase) {}

  async createSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId, courseId, teacherId, day, startTime, endTime, semester } = req.body;

      if (!isValidObjectId(departmentId) || !isValidObjectId(courseId) || !isValidObjectId(teacherId)) {
        return next(createHttpError("Invalid department, course, or teacher ID", HttpStatus.BAD_REQUEST));
      }

      if (!day || !startTime || !endTime || !semester) {
        return next(createHttpError("Missing required fields", HttpStatus.BAD_REQUEST));
      }

      const schedule = await this.scheduleUseCase.createSchedule({ departmentId, courseId, teacherId, day, startTime, endTime, semester });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Schedule created successfully",
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }

  async findScheduleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return next(createHttpError("Invalid schedule ID", HttpStatus.BAD_REQUEST));
      }

      const schedule = await this.scheduleUseCase.findScheduleById(id);
      if (!schedule) {
        return next(createHttpError("Schedule not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return next(createHttpError("Invalid schedule ID", HttpStatus.BAD_REQUEST));
      }

      const updated = await this.scheduleUseCase.updateSchedule(id, req.body);
      if (!updated) {
        return next(createHttpError("Schedule not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Schedule updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return next(createHttpError("Invalid schedule ID", HttpStatus.BAD_REQUEST));
      }

      const deleted = await this.scheduleUseCase.deleteSchedule(id);
      if (!deleted) {
        return next(createHttpError("Schedule not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getAllSchedules(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schedules = await this.scheduleUseCase.getAllSchedules();
      res.status(HttpStatus.OK).json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  async getSchedulesByDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId } = req.params;
      if (!isValidObjectId(departmentId)) {
        return next(createHttpError("Invalid department ID", HttpStatus.BAD_REQUEST));
      }

      const schedules = await this.scheduleUseCase.getSchedulesByDepartment(departmentId);
      res.status(HttpStatus.OK).json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  async getSchedulesByTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId } = req.params;
      if (!isValidObjectId(teacherId)) {
        return next(createHttpError("Invalid teacher ID", HttpStatus.BAD_REQUEST));
      }

      const schedules = await this.scheduleUseCase.getSchedulesByTeacher(teacherId);
      res.status(HttpStatus.OK).json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  async startLiveClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return next(createHttpError("Invalid schedule ID", HttpStatus.BAD_REQUEST));
      }

      const updated = await this.scheduleUseCase.startLiveClass(id);
      if (!updated) {
        return next(createHttpError("Schedule not found", HttpStatus.NOT_FOUND));
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Live class started",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
