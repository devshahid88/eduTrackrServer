import { IAnnouncement } from '../../infrastructure/models/AnnouncementModel';

export interface IAnnouncementRepository {
  create(announcement: Partial<IAnnouncement>): Promise<IAnnouncement>;
  findAll(): Promise<IAnnouncement[]>;
  findById(id: string): Promise<IAnnouncement | null>;
  update(id: string, announcement: Partial<IAnnouncement>): Promise<IAnnouncement | null>;
  delete(id: string): Promise<boolean>;
  findByTargetRole(role: string): Promise<IAnnouncement[]>;
}
