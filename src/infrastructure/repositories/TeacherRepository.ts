import { ITeacherRepository } from "../../application/Interfaces/ITeacher";
import Teacher from "../../domain/entities/Teacher";  
import teacherModel, { ITeacherDocument } from "../models/TeacherModel";
import { BaseRepository } from "./BaseRepository";
import { TeacherMapper } from "../mappers/TeacherMapper";

import { ILogger } from "../../application/Interfaces/ILogger";

export class TeacherRepository extends BaseRepository<Teacher, ITeacherDocument> implements ITeacherRepository {

  constructor(private logger: ILogger) {
    super(teacherModel);
  }

  protected toEntity(model: ITeacherDocument): Teacher {
    return TeacherMapper.toDomain(model);
  }

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
    return this.toEntity(populatedTeacher as any);
  }

  async findTeacherById(id: string): Promise<Teacher | null> {
    const teacher = await this._model.findById(id)
      .populate('department', 'name code');
    return teacher ? this.toEntity(teacher) : null;
  }

  async findTeacherByEmail(mail: string): Promise<Teacher | null> {
    const teacher = await this._model.findOne({ email: mail })
      .populate('department', 'name code');
    return teacher ? this.toEntity(teacher) : null;
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updatedTeacher = await this._model.findByIdAndUpdate(id, teacher, { new: true })
      .populate('department', 'name code');
    return updatedTeacher ? this.toEntity(updatedTeacher) : null;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await this._model.find()
      .populate('department', 'name code');
    return teachers.map(t => this.toEntity(t));
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

    const teachers = await this._model.find(query);
    return teachers.map((teacher) => this.toEntity(teacher));
  }
}
