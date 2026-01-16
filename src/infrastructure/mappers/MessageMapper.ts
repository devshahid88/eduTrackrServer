import { MessageEntity } from "../../domain/entities/Message";
import { IMessage } from "../models/chat.models";

export class MessageMapper {
  static toDomain(raw: any | IMessage): any {
    return {
      _id: raw._id ? raw._id.toString() : raw.id,
      id: raw._id ? raw._id.toString() : raw.id,
      chatId: raw.chatId,
      sender: raw.sender,
      senderModel: raw.senderModel,
      receiver: raw.receiver,
      receiverModel: raw.receiverModel,
      message: raw.message,
      mediaUrl: raw.mediaUrl,
      mediaType: raw.mediaType,
      replyTo: raw.replyTo,
      reactions: (raw.reactions || []).map((r: any) => ({
        reaction: r.reaction,
        userId: r.user ? r.user.toString() : r.userId
      })),
      timestamp: raw.timestamp,
      isDeleted: raw.isDeleted || false,
    };
  }

  static toPersistence(domain: MessageEntity): any {
    return {
      chatId: domain.chatId,
      sender: domain.sender,
      senderModel: domain.senderModel,
      receiver: domain.receiver,
      receiverModel: domain.receiverModel,
      message: domain.message,
      mediaUrl: domain.mediaUrl,
      mediaType: domain.mediaType,
      replyTo: domain.replyTo,
      reactions: domain.reactions,
      timestamp: domain.timestamp,
      isDeleted: domain.isDeleted,
    };
  }
}
