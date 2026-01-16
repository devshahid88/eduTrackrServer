import { Resource } from "../../domain/entities/Resource";
import { IResource } from "../models/ResourceModel";

export class ResourceMapper {
  static toDomain(raw: any | IResource): Resource {
    return Resource.create({
      _id: raw._id ? raw._id.toString() : raw.id,
      title: raw.title,
      description: raw.description,
      type: raw.type,
      url: raw.url,
      role: raw.role,
      uploadedBy: raw.uploadedBy ? raw.uploadedBy.toString() : raw.uploadedBy,
      createdAt: raw.createdAt,
      courseId: raw.courseId ? raw.courseId.toString() : undefined
    });
  }
}
