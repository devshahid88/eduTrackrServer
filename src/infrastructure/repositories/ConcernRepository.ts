import { IConcernRepository } from '../../application/Interfaces/IConcernRepository';
import { Concern, ConcernStatus } from '../../domain/entities/Concern';
import ConcernModel from '../models/ConcernModel';

export class ConcernRepository implements IConcernRepository {
  async createConcern(concern: Partial<Concern>): Promise<Concern> {
    const created = await ConcernModel.create(concern);
    return new Concern({
      id: (created._id as any).toString(),
      ...created.toObject(),
    });
  }

  async getConcernById(id: string): Promise<Concern | null> {
    const found = await ConcernModel.findById(id);
    return found ? new Concern({ id: (found._id as any).toString(), ...found.toObject() }) : null;
  }

  async getConcernsByUser(userId: string): Promise<Concern[]> {
    const concerns = await ConcernModel.find({ createdBy: userId }) as Array<InstanceType<typeof ConcernModel>>;
    return concerns.map(c => new Concern({ id: (c._id as any).toString(), ...c.toObject() }));
  }

  async getAllConcerns(): Promise<Concern[]> {
    const concerns = await ConcernModel.find() as Array<InstanceType<typeof ConcernModel>>;
    return concerns.map(c => new Concern({ id: (c._id as any).toString(), ...c.toObject() }));
  }

  async updateConcernStatus(id: string, status: ConcernStatus, feedback?: string): Promise<Concern | null> {
    const updated = await ConcernModel.findByIdAndUpdate(
      id,
      { status, feedback, updatedAt: new Date() },
      { new: true }
    );
    return updated ? new Concern({ id: (updated._id as any).toString(), ...updated.toObject() }) : null;
  }
} 