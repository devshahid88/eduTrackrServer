import { Resource } from '../../domain/entities/Resource';
import { IBaseRepository } from './IBaseRepository';

export interface IResourceRepository extends IBaseRepository<Resource> {
  findAll(filter?: any): Promise<Resource[]>;
  findByCourseId(courseId: string): Promise<Resource[]>;
}

