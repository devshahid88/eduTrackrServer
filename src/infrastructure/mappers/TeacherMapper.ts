import Teacher from "../../domain/entities/Teacher";
import { ITeacherDocument } from "../models/TeacherModel";

export class TeacherMapper {
  static toDomain(doc: ITeacherDocument | any): Teacher {
    const departmentId = doc.department?._id?.toString() || 
                       (typeof doc.department === 'string' ? doc.department : '');
    const departmentName = doc.department?.name || '';
    
    // Default image logic moved here from repo
    const defaultProfileImage = "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";
    let profileImage = defaultProfileImage;
    if (doc.profileImage) {
      if (typeof doc.profileImage === 'string' && doc.profileImage.trim() !== '') {
        profileImage = doc.profileImage;
      }
    }

    return new Teacher({
      id: doc._id?.toString(),  
      username: doc.username,
      firstname: doc.firstname,
      lastname: doc.lastname,
      email: doc.email,
      password: doc.password,
      profileImage: profileImage,
      department: departmentId,
      departmentName: departmentName,
      role: 'Teacher',
    });
  }
}
