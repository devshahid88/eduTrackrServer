import { Request, Response, NextFunction } from 'express';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import { HttpStatus } from '../../common/enums/http-status.enum';

export class ResourceController {
  constructor(private resourceUseCase: ResourceUseCase) {}

  async createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = (req as any).user;
      const resourceData = { ...req.body, uploadedBy: id };
      
      const newResource = await this.resourceUseCase.createResource(resourceData);

      res.status(HttpStatus.CREATED).json({
        message: 'Resource created successfully',
        data: newResource,
        success: true
      });
    } catch (error) {
      console.error('Error in createResource:', error);
      next(error);
    }
  }

  async getAllResources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = (req as any).user;
      const resources = await this.resourceUseCase.getAllResources(role);

      res.status(HttpStatus.OK).json({
        message: 'Resources retrieved successfully',
        data: resources,
        success: true
      });
    } catch (error) {
      console.error('Error in getAllResources:', error);
      next(error);
    }
  }

  async getResourceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await this.resourceUseCase.getResourceById(id);

      if (!resource) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Resource not found',
          success: false
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: 'Resource retrieved successfully',
        data: resource,
        success: true
      });
    } catch (error) {
       console.error('Error in getResourceById:', error);
       next(error);
    }
  }

  async updateResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedResource = await this.resourceUseCase.updateResource(id, updateData);

      if (!updatedResource) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Resource not found',
          success: false
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: 'Resource updated successfully',
        data: updatedResource,
        success: true
      });
    } catch (error) {
        console.error('Error in updateResource:', error);
        next(error);
    }
  }

  async deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.resourceUseCase.deleteResource(id);

      if (!result) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Resource not found',
          success: false
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: 'Resource deleted successfully',
        success: true
      });
    } catch (error) {
        console.error('Error in deleteResource:', error);
        next(error);
    }
  }
}
