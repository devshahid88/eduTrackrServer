import { IConcernRepository } from '../../application/Interfaces/IConcernRepository';
import { Concern, ConcernStatus } from '../../domain/entities/Concern';
import ConcernModel, { IConcern } from '../models/ConcernModel';
import { BaseRepository } from "./BaseRepository";
import { ConcernMapper } from "../mappers/ConcernMapper";

import { ILogger } from '../../application/Interfaces/ILogger';

export class ConcernRepository extends BaseRepository<Concern, IConcern> implements IConcernRepository {
  
  constructor(private logger: ILogger) {
    super(ConcernModel);
  }

  protected toEntity(model: IConcern): Concern {
    return ConcernMapper.toDomain(model);
  }

  async createConcern(concern: Partial<Concern>): Promise<Concern> {
    const created = await this._model.create(concern);
    return this.toEntity(created);
  }

  async getConcernById(id: string): Promise<Concern | null> {
    return this.findById(id);
  }

  async getConcernsByUser(userId: string): Promise<Concern[]> {
    const concerns = await this._model.find({ createdBy: userId });
    return concerns.map(c => this.toEntity(c));
  }

  async getAllConcerns(): Promise<Concern[]> {
    return this.findAll();
  }

  async updateConcernStatus(id: string, status: ConcernStatus, feedback?: string): Promise<Concern | null> {
    const updated = await this._model.findByIdAndUpdate(
      id,
      { status, feedback, updatedAt: new Date() },
      { new: true }
    );
    return updated ? this.toEntity(updated) : null;
  }
}