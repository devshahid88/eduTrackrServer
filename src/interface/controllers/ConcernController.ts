import { Request, Response, NextFunction } from 'express';
import { ConcernUseCase } from '../../application/useCases/ConcernUseCase';
import { HttpStatus } from '../../common/enums/http-status.enum';
import ConcernModel from '../../infrastructure/models/ConcernModel';
import { ConcernStatus } from '../../domain/entities/Concern'; // Import from Concern.ts

// Import the global type extension
// import '../../types/express.d.ts'; 
// Add .d.ts extension// 
type UserRoleType = 'Student' | 'Teacher' | 'Admin';

export class ConcernController {
  constructor(private concernUseCase: ConcernUseCase) {}

  async raiseConcern(req: Request, res: Response, next: NextFunction) {
    console.log('Controller - Raise Concern:', req.body);
    try {
      // Check if user exists (should always exist due to middleware)
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const { title, description, raisedBy, createdBy } = req.body;
      const userId = raisedBy || createdBy || req.user.id;
      
      // Map string role to enum
      const roleMapping: { [key: string]: UserRoleType } = {
        'student': 'Student',
        'teacher': 'Teacher',
        'admin': 'Admin'
      };
      
      const userRole = roleMapping[req.user.role.toLowerCase()] || 'Student';
      
      const concern = await this.concernUseCase.raiseConcern({
        title,
        description,
        createdBy: userId,
        createdByRole: userRole,
        status: ConcernStatus.PENDING, // This should now work correctly
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      res.status(HttpStatus.CREATED).json({ success: true, data: concern });
    } catch (err) {
      next(err);
    }
  }

  async getMyConcerns(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const userId = req.user.id;
      const concerns = await this.concernUseCase.getConcernsByUser(userId);
      res.status(HttpStatus.OK).json({ success: true, data: concerns });
    } catch (err) {
      next(err);
    }
  }

  async getAllConcerns(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const concerns = await this.concernUseCase.getAllConcerns();
      res.status(HttpStatus.OK).json({ success: true, data: concerns });
    } catch (err) {
      next(err);
    }
  }

  async updateConcernStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const { id } = req.params;
      const { status, feedback } = req.body;
      const updated = await this.concernUseCase.updateConcernStatus(id, status, feedback);
      res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async updateConcern(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const { id } = req.params;
      const { title, description, status, feedback } = req.body;
      
      // Fetch existing concern
      const concern = await this.concernUseCase.getConcernById(id);
      if (!concern) {
        return res.status(HttpStatus.NOT_FOUND).json({ 
          success: false, 
          message: 'Concern not found' 
        });
      }
      
      // Update fields
      if (title !== undefined) concern.title = title;
      if (description !== undefined) concern.description = description;
      if (status !== undefined) concern.status = status;
      if (feedback !== undefined) concern.feedback = feedback;
      concern.updatedAt = new Date();
      
      // Save update
      const updated = await this.concernUseCase.raiseConcern(concern); // reuse create for upsert
      res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deleteConcern(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const { id } = req.params;
      const concern = await this.concernUseCase.getConcernById(id);
      if (!concern) {
        return res.status(HttpStatus.NOT_FOUND).json({ 
          success: false, 
          message: 'Concern not found' 
        });
      }
      
      await (ConcernModel as any).findByIdAndDelete(id); // direct model access for delete
      res.status(HttpStatus.OK).json({ success: true, message: 'Concern deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getConcernsByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const { userId } = req.params;
      const concerns = await this.concernUseCase.getConcernsByUser(userId);
      res.status(HttpStatus.OK).json({ success: true, data: concerns });
    } catch (err) {
      next(err);
    }
  }
}