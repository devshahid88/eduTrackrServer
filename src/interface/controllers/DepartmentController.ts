import { Request, Response, NextFunction } from "express";
import { DepartmentUseCase } from "../../application/useCases/DepartmentUseCase";
import { isValidObjectId } from "mongoose";
import { HttpStatus } from '../../common/enums/http-status.enum';

import { ILogger } from "../../application/Interfaces/ILogger";

export class DepartmentController {
  constructor(
    private departmentUseCase: DepartmentUseCase,
    private logger: ILogger
  ) {}

  async createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await this.departmentUseCase.createDepartment(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Department created successfully",
        data: department
      });
    } catch (error: any) {
      this.logger.error("Create department error:", error);
      next(error);
    }
  }

  async getDepartmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid department ID"
        });
        return;
      }

      const department = await this.departmentUseCase.getDepartmentById(id);

      if (!department) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Department not found"
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: department
      });
    } catch (error: any) {
      this.logger.error("Get department error:", error);
      next(error);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid department ID"
        });
        return;
      }

      const department = await this.departmentUseCase.updateDepartment(id, req.body);

      if (!department) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Department not found"
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Department updated successfully",
        data: department
      });
    } catch (error: any) {
      this.logger.error("Update department error:", error);
      next(error);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid department ID"
        });
        return;
      }

      const deleted = await this.departmentUseCase.deleteDepartment(id);

      if (!deleted) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Department not found"
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Department deleted successfully"
      });
    } catch (error: any) {
      this.logger.error("Delete department error:", error);
      next(error);
    }
  }

  async getAllDepartments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await this.departmentUseCase.getAllDepartments();
      res.status(HttpStatus.OK).json({
        success: true,
        data: departments
      });
    } catch (error: any) {
      this.logger.error("Get all departments error:", error);
      next(error);
    }
  }
}
