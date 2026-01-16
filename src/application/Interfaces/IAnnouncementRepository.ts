import { Announcement } from '../../domain/entities/Announcement';
import { IBaseRepository } from './IBaseRepository';

export interface IAnnouncementRepository extends IBaseRepository<Announcement> {
  findByTargetRole(role: string): Promise<Announcement[]>;
}

