import { IResourceRepository } from '../../domain/repositories/IResourceRepository';
import { IResource, ResourceModel } from '../models/ResourceModel';

export class ResourceRepository implements IResourceRepository {
  async create(resource: Partial<IResource>): Promise<IResource> {
    const newResource = new ResourceModel(resource);
    return await newResource.save();
  }

  async findAll(filter: any = {}): Promise<IResource[]> {
    return await ResourceModel.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IResource | null> {
    return await ResourceModel.findById(id);
  }

  async update(id: string, resource: Partial<IResource>): Promise<IResource | null> {
    return await ResourceModel.findByIdAndUpdate(id, resource, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await ResourceModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByCourseId(courseId: string): Promise<IResource[]> {
    return await ResourceModel.find({ courseId }).sort({ createdAt: -1 });
  }
}
