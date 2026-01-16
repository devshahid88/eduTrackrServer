import { IStudentRepository } from "../../application/Interfaces/IStudent";
import Student from "../../domain/entities/Student";
import studentModel, { IStudentDocument } from "../models/StudentModel";
import { BaseRepository } from "./BaseRepository";
import { StudentMapper } from "../mappers/StudentMapper";

import { ILogger } from "../../application/Interfaces/ILogger";

export class StudentRepository extends BaseRepository<Student, IStudentDocument> implements IStudentRepository {
  
  constructor(private logger: ILogger) {
    super(studentModel);
  }

  protected toEntity(model: IStudentDocument): Student {
    return StudentMapper.toDomain(model);
  }

  // Helper for consistent population
  private get populateQuery() {
    return [
      { path: 'department', select: 'name code establishedDate headOfDepartment' },
      {
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name',
        },
      }
    ];
  }

  async createStudent(student: Student): Promise<Student> {
    const newStudent = new studentModel(student);
    const savedStudent = await newStudent.save();
    const populatedStudent = await savedStudent.populate('department', 'name');
    return this.toEntity(populatedStudent as any);
  }

  async findStudentById(id: string): Promise<Student | null> {
    const student = await this._model.findById(id).populate(this.populateQuery);
    return student ? this.toEntity(student) : null;
  }

  async findStudentByEmail(email: string): Promise<Student | null> {
    const student = await this._model.findOne({ email }).populate(this.populateQuery);
    return student ? this.toEntity(student) : null;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student | null> {
    const updated = await this._model.findByIdAndUpdate(id, student, { new: true }).populate(this.populateQuery);
    return updated ? this.toEntity(updated) : null;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await this._model.find().populate(this.populateQuery);
    return students.map((student) => this.toEntity(student));
  }

  async searchUsers(searchTerm: string, role: string = 'Student'): Promise<Student[]> {
    const query: any = {
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    if (role !== 'All') {
      query.role = role;
    }

    const students = await this._model.find(query).populate(this.populateQuery);
    return students.map((student) => this.toEntity(student));
  }
}