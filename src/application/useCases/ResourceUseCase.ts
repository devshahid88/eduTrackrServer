import { IResourceRepository } from '../../domain/repositories/IResourceRepository';
import { IResource } from '../../infrastructure/models/ResourceModel';

export class ResourceUseCase {
  constructor(private resourceRepository: IResourceRepository) {}

  async createResource(resource: Partial<IResource>): Promise<IResource> {
    return await this.resourceRepository.create(resource);
  }

  async getAllResources(role?: string): Promise<IResource[]> {
    try {
      let filter = {};
      if (role && role !== 'Admin') {
        // Teachers see Teacher and Student resources
        // Students see only Student resources
        if (role === 'Teacher') {
          filter = { role: { $in: ['Teacher', 'Student'] } };
        } else if (role === 'Student') {
          filter = { role: 'Student' };
        }
      }
      return await this.resourceRepository.findAll(filter);
    } catch (error) {
      console.error('Error in getAllResources UseCase:', error);
      throw error;
    }
  }

  async getResourceById(id: string): Promise<IResource | null> {
    return await this.resourceRepository.findById(id);
  }

  async updateResource(id: string, resource: Partial<IResource>): Promise<IResource | null> {
    return await this.resourceRepository.update(id, resource);
  }

  async deleteResource(id: string): Promise<boolean> {
    return await this.resourceRepository.delete(id);
  }
  
  async getResourcesByCourse(courseId: string): Promise<IResource[]> {
      return await this.resourceRepository.findByCourseId(courseId);
  }
}
