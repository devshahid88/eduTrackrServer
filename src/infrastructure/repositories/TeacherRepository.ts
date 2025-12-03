import { ITeacherRepository } from "../../application/Interfaces/ITeacher";
import Teacher from "../../domain/entities/Teacher";  
import teacherModel from "../models/TeacherModel";  

export class TeacherRepository implements ITeacherRepository {

  async createTeacher(teacher: Teacher): Promise<Teacher> {
    const newTeacher = new teacherModel({
      username: teacher.username,
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      email: teacher.email,
      password: teacher.password,
      profileImage: teacher.profileImage,
      department: teacher.department,
      role: teacher.role,
    });
    const savedTeacher = await newTeacher.save();
    const populatedTeacher = await savedTeacher.populate('department', 'name code');
    return this.mapToEntity(populatedTeacher.toObject());
  }

  async findTeacherById(id: string): Promise<Teacher | null> {
    const teacher = await teacherModel.findById(id)
      .populate('department', 'name code')
      .lean();
    return teacher ? this.mapToEntity(teacher) : null;
  }

  async findTeacherByEmail(mail: string): Promise<Teacher | null> {
    const teacher = await teacherModel.findOne({ email: mail })
      .populate('department', 'name code')
      .lean();
    return teacher ? this.mapToEntity(teacher) : null;
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updatedTeacher = await teacherModel.findByIdAndUpdate(id, teacher, { new: true })
      .populate('department', 'name code')
      .lean();
    return updatedTeacher ? this.mapToEntity(updatedTeacher) : null;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await teacherModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await teacherModel.find()
      .populate('department', 'name code')
      .lean();
    return teachers.map(this.mapToEntity);
  }
  async searchUsers(searchTerm: string, role: string = 'Teacher'): Promise<Teacher[]> {
    const query: any = {
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    if (role !== 'All') {
      query.role = role;
    }

    const teachers = await teacherModel.find(query).lean();
    return teachers.map((teacher) => this.toEntity(teacher));
  }

  private toEntity(teacherObj: any): Teacher {
    return new Teacher({
        id: teacherObj._id?.toString(),
        username: teacherObj.username,
        email: teacherObj.email,
        firstname: teacherObj.firstname,
        lastname: teacherObj.lastname,
        password: teacherObj.password,
        profileImage: teacherObj.profileImage,
        role: teacherObj.role || 'Teacher',
        // ...add other fields as needed
    });
}
  private mapToEntity(doc: any): Teacher {
    const departmentId = doc.department?._id?.toString() || 
                       (typeof doc.department === 'string' ? doc.department : '');
    const departmentName = doc.department?.name || '';
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
