import { IAnnouncementRepository } from '../../application/Interfaces/IAnnouncementRepository';
import { Announcement } from '../../domain/entities/Announcement';
import { AnnouncementModel, IAnnouncement } from '../models/AnnouncementModel';
import { BaseRepository } from "./BaseRepository";
import { AnnouncementMapper } from "../mappers/AnnouncementMapper";

import { ILogger } from '../../application/Interfaces/ILogger';

export class AnnouncementRepository extends BaseRepository<Announcement, IAnnouncement> implements IAnnouncementRepository {

  constructor(private logger: ILogger) {
    super(AnnouncementModel);
  }

  protected toEntity(model: IAnnouncement): Announcement {
    return AnnouncementMapper.toDomain(model);
  }

  // Override findAll to keep the sort order
  async findAll(): Promise<Announcement[]> {
    const foundList = await this._model.find().sort({ createdAt: -1 });
    return foundList.map((item) => this.toEntity(item));
  }

  async findByTargetRole(role: string): Promise<Announcement[]> {
    // Find announcements where targetRoles array includes the specified role
    const announcements = await this._model.find({ targetRoles: role }).sort({ createdAt: -1 });
    return announcements.map(a => this.toEntity(a));
  }
}
