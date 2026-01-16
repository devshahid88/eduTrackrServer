import { Notification } from "../../domain/entities/Notification";
import { INotification } from "../models/notification.models";

export class NotificationMapper {
  static toDomain(raw: any | INotification): Notification {
    return Notification.create({
      _id: raw._id ? raw._id.toString() : raw.id,
      userId: raw.userId ? raw.userId.toString() : raw.userId,
      userModel: raw.userModel,
      type: raw.type,
      title: raw.title,
      message: raw.message,
      read: raw.read,
      timestamp: raw.timestamp,
      sender: raw.sender,
      senderModel: raw.senderModel,
      role: raw.role,
      data: raw.data
    });
  }
}
