import { Concern, ConcernStatus } from '../../domain/entities/Concern';
import { IBaseRepository } from './IBaseRepository';

export interface IConcernRepository extends IBaseRepository<Concern> {
  createConcern(concern: Partial<Concern>): Promise<Concern>;
  getConcernById(id: string): Promise<Concern | null>;
  getConcernsByUser(userId: string): Promise<Concern[]>;
  getAllConcerns(): Promise<Concern[]>;
  updateConcernStatus(id: string, status: ConcernStatus, feedback?: string): Promise<Concern | null>;
}
