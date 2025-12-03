import { Request, Response, NextFunction } from "express";
import { AdminUseCase } from "../../application/useCases/AdminUseCase";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { HttpMessage } from "../../common/enums/http-message.enum";

export class AdminController {
  constructor(private adminUseCase: AdminUseCase) {}

  async createAdminWithImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminData = req.body;
      const profileImagePath = req.file?.path;
      const admin = await this.adminUseCase.createAdmin(adminData, profileImagePath);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: HttpMessage.ADMIN_CREATED,
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAdminProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.params.id;
      const profileImagePath = req.file?.path;

      if (!profileImagePath) {
        return next({
          status: HttpStatus.BAD_REQUEST,
          message: HttpMessage.NO_IMAGE_UPLOADED,
        });
      }

      const updatedAdmin = await this.adminUseCase.updateAdminProfileImage(adminId, profileImagePath);
      if (!updatedAdmin) {
        return next({
          status: HttpStatus.NOT_FOUND,
          message: HttpMessage.ADMIN_NOT_FOUND,
        });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.PROFILE_IMAGE_UPDATED,
        data: {
          profileImage: updatedAdmin.profileImage,
          admin: updatedAdmin,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async findAdminById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = await this.adminUseCase.findAdminById(req.params.id);
      if (!admin) {
        return next({
          status: HttpStatus.NOT_FOUND,
          message: HttpMessage.ADMIN_NOT_FOUND,
        });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.ADMIN_RETRIEVED,
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.params.id;
      const adminData = req.body;
      const profileImagePath = req.file?.path;

      const updatedAdmin = await this.adminUseCase.updateAdmin(adminId, adminData, profileImagePath);
      if (!updatedAdmin) {
        return next({
          status: HttpStatus.NOT_FOUND,
          message: HttpMessage.ADMIN_NOT_FOUND,
        });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.ADMIN_RETRIEVED,
        data: updatedAdmin,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await this.adminUseCase.deleteAdmin(req.params.id);
      if (!deleted) {
        return next({
          status: HttpStatus.NOT_FOUND,
          message: HttpMessage.ADMIN_NOT_FOUND,
        });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.ADMIN_DELETED,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await this.adminUseCase.getAllAdmins();
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.ADMINS_RETRIEVED,
        data: admins,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { searchTerm = "", role } = req.query;

      if (typeof searchTerm !== "string") {
        return next({
          status: HttpStatus.BAD_REQUEST,
          message: HttpMessage.INVALID_SEARCH_TERM,
        });
      }

      if (role && typeof role !== "string") {
        return next({
          status: HttpStatus.BAD_REQUEST,
          message: HttpMessage.INVALID_ROLE_PARAM,
        });
      }

      const users = await this.adminUseCase.searchUsers(searchTerm, role as string);
      console.log("Search Users Result:", users);

      res.status(HttpStatus.OK).json({
        success: true,
        data: users,
        message: users.length ? HttpMessage.USERS_RETRIEVED : HttpMessage.NO_USERS_FOUND,
      });
    } catch (error) {
      next(error);
    }
  }
}
