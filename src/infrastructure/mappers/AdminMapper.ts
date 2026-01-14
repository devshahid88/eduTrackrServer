import Admin from "../../domain/entities/Admin";
import { IAdminDocument } from "../models/AdminModel";

export class AdminMapper {
  static toDomain(raw: IAdminDocument): Admin {
    return new Admin({
      id: (raw._id as unknown as string).toString(),
      username: raw.username,
      email: raw.email,
      firstname: raw.firstname,
      lastname: raw.lastname,
      password: raw.password,
      profileImage: raw.profileImage,
      role: raw.role || 'Admin',
    });
  }

//   static toPersistence(domain: Admin): any {
//     // Implemented if needed for specific use cases not covered by standard model.create(obj)
//     return { ...domain }; 
//   }
}
