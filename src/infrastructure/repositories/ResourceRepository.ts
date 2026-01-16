import { IResourceRepository } from '../../application/Interfaces/IResourceRepository';
import { IResource, ResourceModel } from '../models/ResourceModel';
import { Resource } from '../../domain/entities/Resource';
import { BaseRepository } from "./BaseRepository";
import { ResourceMapper } from "../mappers/ResourceMapper";

import { ILogger } from '../../application/Interfaces/ILogger';

export class ResourceRepository extends BaseRepository<Resource, IResource> implements IResourceRepository {
  
  constructor(private logger: ILogger) {
    super(ResourceModel);
  }

  protected toEntity(model: IResource): Resource {
    return ResourceMapper.toDomain(model);
  }

  async findAll(filter: any = {}): Promise<Resource[]> {
    const resources = await this._model.find(filter).sort({ createdAt: -1 });
    return resources.map(r => this.toEntity(r));
  }

  async findByCourseId(courseId: string): Promise<Resource[]> {
    const resources = await this._model.find({ courseId }).sort({ createdAt: -1 });
    return resources.map(r => this.toEntity(r));
  }
}
