import { Request, Response, NextFunction } from 'express';
import { AnnouncementUseCase } from '../../application/useCases/AnnouncementUseCase';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class AnnouncementController {
  constructor(private announcementUseCase: AnnouncementUseCase) {}

  async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = (req as any).user;
      const announcementData = { ...req.body, createdBy: id };
      const newAnnouncement = await this.announcementUseCase.createAnnouncement(announcementData);

      res.status(HttpStatus.CREATED).json({
        message: 'Announcement created successfully',
        data: newAnnouncement,
        success: true
      });
    } catch (error) {
      console.error('Error in createAnnouncement:', error);
      next(error);
    }
  }

  async getAllAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcements = await this.announcementUseCase.getAllAnnouncements();

      res.status(HttpStatus.OK).json({
        message: 'Announcements retrieved successfully',
        data: announcements,
        success: true
      });
    } catch (error) {
       console.error('Error in getAllAnnouncements:', error);
       next(error);
    }
  }

  async getAnnouncementById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const announcement = await this.announcementUseCase.getAnnouncementById(id);

      if (!announcement) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Announcement not found',
          success: false
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: 'Announcement retrieved successfully',
        data: announcement,
        success: true
      });
    } catch (error) {
        console.error('Error in getAnnouncementById:', error);
        next(error);
    }
  }

  async updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedAnnouncement = await this.announcementUseCase.updateAnnouncement(id, updateData);

       if (!updatedAnnouncement) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Announcement not found',
          success: false
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: 'Announcement updated successfully',
        data: updatedAnnouncement,
        success: true
      });
    } catch (error) {
        console.error('Error in updateAnnouncement:', error);
        next(error);
    }
  }

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.announcementUseCase.deleteAnnouncement(id);

       if (!result) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Announcement not found',
          success: false
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: 'Announcement deleted successfully',
        success: true
      });
    } catch (error) {
        console.error('Error in deleteAnnouncement:', error);
        next(error);
    }
  }
}
