import { IAnnouncementRepository } from '../../domain/repositories/IAnnouncementRepository';
import { IAnnouncement, AnnouncementModel } from '../models/AnnouncementModel';

export class AnnouncementRepository implements IAnnouncementRepository {
  async create(announcement: Partial<IAnnouncement>): Promise<IAnnouncement> {
    const newAnnouncement = new AnnouncementModel(announcement);
    return await newAnnouncement.save();
  }

  async findAll(): Promise<IAnnouncement[]> {
    return await AnnouncementModel.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IAnnouncement | null> {
    return await AnnouncementModel.findById(id);
  }

  async update(id: string, announcement: Partial<IAnnouncement>): Promise<IAnnouncement | null> {
    return await AnnouncementModel.findByIdAndUpdate(id, announcement, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await AnnouncementModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByTargetRole(role: string): Promise<IAnnouncement[]> {
    // Find announcements where targetRoles array includes the specified role
    return await AnnouncementModel.find({ targetRoles: role }).sort({ createdAt: -1 });
  }
}
