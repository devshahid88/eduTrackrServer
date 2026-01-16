import { Chatlist } from "../../domain/entities/Chatlist";
import { IChatList } from "../models/chat.models";

export class ChatListMapper {
  static toDomain(raw: any | IChatList): Chatlist {
    return new Chatlist({
      _id: raw._id ? raw._id.toString() : raw.id,
      user: raw.user,
      userModel: raw.userModel,
      teacherId: raw.teacherId,
      studentId: raw.studentId,
      chats: raw.chats ? raw.chats.map((chat: any) => ({
        chatId: chat.chatId,
        contact: chat.contact,
        contactModel: chat.contactModel,
        lastMessage: chat.lastMessage,
        timestamp: chat.timestamp,
        unreadCount: chat.unreadCount
      })) : []
    });
  }

  static toPersistence(domain: Chatlist): any {
    return {
      user: domain.user,
      userModel: domain.userModel,
      teacherId: domain.teacherId,
      studentId: domain.studentId,
      chats: domain.chats.map((chat: any) => ({
        chatId: chat.chatId,
        contact: chat.contact,
        contactModel: chat.contactModel,
        lastMessage: chat.lastMessage,
        timestamp: chat.timestamp,
        unreadCount: chat.unreadCount
      }))
    };
  }
}
