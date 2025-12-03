import { IConcernRepository } from '../Interfaces/IConcernRepository';
import { Concern, ConcernStatus } from '../../domain/entities/Concern';

export class ConcernUseCase {
  constructor(private concernRepository: IConcernRepository) {}

  async raiseConcern(data: Partial<Concern>): Promise<Concern> {
    return this.concernRepository.createConcern(data);
  }

  async getConcernById(id: string): Promise<Concern | null> {
    return this.concernRepository.getConcernById(id);
  }

  async getConcernsByUser(userId: string): Promise<Concern[]> {
    return this.concernRepository.getConcernsByUser(userId);
  }

  async getAllConcerns(): Promise<Concern[]> {
    return this.concernRepository.getAllConcerns();
  }

  async updateConcernStatus(id: string, status: ConcernStatus, feedback?: string): Promise<Concern | null> {
    return this.concernRepository.updateConcernStatus(id, status, feedback);
  }

  async deleteConcern(id: string): Promise<void> {
    // This can be implemented in the repository for full clean architecture
    // For now, deletion is handled in the controller for simplicity
    return;
  }
} 