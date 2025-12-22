import { IResource } from '../../infrastructure/models/ResourceModel';

export interface IResourceRepository {
  create(resource: Partial<IResource>): Promise<IResource>;
  findAll(filter?: any): Promise<IResource[]>;
  findById(id: string): Promise<IResource | null>;
  update(id: string, resource: Partial<IResource>): Promise<IResource | null>;
  delete(id: string): Promise<boolean>;
  findByCourseId(courseId: string): Promise<IResource[]>;
}
