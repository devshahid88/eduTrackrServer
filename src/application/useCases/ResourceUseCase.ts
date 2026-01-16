import { IResourceRepository } from '../Interfaces/IResourceRepository';
import { Resource } from '../../domain/entities/Resource';

import { ILogger } from '../Interfaces/ILogger';

export class ResourceUseCase {
  constructor(
    private resourceRepository: IResourceRepository,
    private logger: ILogger
  ) {}

  async createResource(resourceData: Partial<Resource>): Promise<Resource> {
    const resource = Resource.create(resourceData);
    return await this.resourceRepository.create(resource);
  }

  async getAllResources(role?: string): Promise<Resource[]> {
    try {
      let filter = {};
      if (role && role !== 'Admin') {
        if (role === 'Teacher') {
          filter = { role: { $in: ['Teacher', 'Student'] } };
        } else if (role === 'Student') {
          filter = { role: 'Student' };
        }
      }
      return await this.resourceRepository.findAll(filter);
    } catch (error) {
      this.logger.error('Error in getAllResources UseCase:', error);
      throw error;
    }
  }

  async getResourceById(id: string): Promise<Resource | null> {
    return await this.resourceRepository.findById(id);
  }

  async updateResource(id: string, resource: Partial<Resource>): Promise<Resource | null> {
    return await this.resourceRepository.update(id, resource);
  }

  async deleteResource(id: string): Promise<boolean> {
    return await this.resourceRepository.delete(id);
  }
  
  async getResourcesByCourse(courseId: string): Promise<Resource[]> {
      return await this.resourceRepository.findByCourseId(courseId);
  }
}
