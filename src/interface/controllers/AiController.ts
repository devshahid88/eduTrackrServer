import { Request, Response, NextFunction } from 'express';
import { AiUseCase } from '../../application/useCases/AiUseCase';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { HttpMessage } from '../../common/enums/http-message.enum';

export class AiController {
  constructor(private aiUseCase: AiUseCase) {}

  async handleStudentChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, context } = req.body;

      if (!message) {
        return next({
          status: HttpStatus.BAD_REQUEST,
          message: HttpMessage.BAD_REQUEST,
          detail: 'Message is required',
        });
      }

      const response = await this.aiUseCase.generateStudentResponse(message, context);
      res.status(HttpStatus.OK).json({ success: true, response });
    } catch (error) {
      next(error);
    }
  }

  async handleTeacherChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, context } = req.body;

      if (!message) {
        return next({
          status: HttpStatus.BAD_REQUEST,
          message: HttpMessage.BAD_REQUEST,
          detail: 'Message is required',
        });
      }

      const response = await this.aiUseCase.generateTeacherResponse(message, context);
      res.status(HttpStatus.OK).json({ success: true, response });
    } catch (error) {
      next(error);
    }
  }
}
