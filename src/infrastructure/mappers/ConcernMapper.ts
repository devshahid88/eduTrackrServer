import { Concern } from "../../domain/entities/Concern";
import { IConcern } from "../models/ConcernModel";

export class ConcernMapper {
  static toDomain(raw: any | IConcern): Concern {
    return new Concern({
      id: raw._id ? raw._id.toString() : raw.id,
      title: raw.title,
      description: raw.description,
      status: raw.status,
      type: raw.type, // Map it if present, otherwise undefined
      feedback: raw.feedback,
      createdBy: raw.createdBy ? (typeof raw.createdBy === 'object' ? raw.createdBy : raw.createdBy.toString()) : undefined,
      createdByRole: raw.createdByRole,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }
}
