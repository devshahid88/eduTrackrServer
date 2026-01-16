import { Announcement } from "../../domain/entities/Announcement";
import { IAnnouncement } from "../models/AnnouncementModel";

export class AnnouncementMapper {
  static toDomain(raw: any | IAnnouncement): Announcement {
    return Announcement.create({
      _id: raw._id ? raw._id.toString() : raw.id,
      title: raw.title,
      message: raw.message,
      targetRoles: raw.targetRoles,
      courseId: raw.courseId ? raw.courseId.toString() : undefined,
      createdBy: raw.createdBy ? raw.createdBy.toString() : undefined,
      createdAt: raw.createdAt
    });
  }
}
