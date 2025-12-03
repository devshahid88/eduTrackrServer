import { AuthUseCase } from "../../application/useCases/AuthUseCase";
import { NextFunction, Request, Response } from "express";
import { HttpStatus } from '../../common/enums/http-status.enum';
import { HttpMessage } from '../../common/enums/http-message.enum';
import { createHttpError } from '../../common/utils/createHttpError';

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  async loginStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(createHttpError(HttpMessage.LOGIN_REQUIRED, HttpStatus.BAD_REQUEST));
      }

      const { student, accessToken, refreshToken } = await this.authUseCase.loginStudent(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.LOGIN_SUCCESS,
        data: {
          student,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(createHttpError(HttpMessage.LOGIN_REQUIRED, HttpStatus.BAD_REQUEST));
      }

      const { admin, accessToken, refreshToken } = await this.authUseCase.loginAdmin(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.LOGIN_SUCCESS,
        data: {
          admin,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async loginTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(createHttpError(HttpMessage.LOGIN_REQUIRED, HttpStatus.BAD_REQUEST));
      }

      const { teacher, accessToken, refreshToken } = await this.authUseCase.loginTeacher(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.LOGIN_SUCCESS,
        data: {
          teacher,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        return next(createHttpError(HttpMessage.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST));
      }
      const response = await this.authUseCase.forgotPassword(email);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.RESET_SENT,
        response,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token as string;
      const { email, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return next(createHttpError(HttpMessage.PASSWORD_REQUIRED, HttpStatus.BAD_REQUEST));
      }

      const result = await this.authUseCase.resetPassword(email, token, newPassword);

      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("Refreshing access token...");
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(createHttpError(HttpMessage.UNAUTHORIZED, HttpStatus.UNAUTHORIZED));
      }

      const { accessToken } = await this.authUseCase.refreshAccessToken(refreshToken);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpMessage.LOGIN_SUCCESS,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}