import { ICourseRepository } from "../../application/Interfaces/ICourseRepository";
import { Course } from "../../domain/entities/Course";
import CourseModel, { ICourseDocument } from "../models/CourseModel";
import { BaseRepository } from "./BaseRepository";
import { CourseMapper } from "../mappers/CourseMapper";

import { ILogger } from "../../application/Interfaces/ILogger";

export class CourseRepository extends BaseRepository<Course, ICourseDocument> implements ICourseRepository {
  
  constructor(private logger: ILogger) {
    super(CourseModel);
  }

  protected toEntity(model: ICourseDocument): Course {
    return CourseMapper.toDomain(model);
  }

  async createCourse(course: Course): Promise<Course> {
    return this.create(course);
  }

  async findCourseById(id: string): Promise<Course | null> {
    const course = await this._model.findById(id).populate('departmentId', 'name');
    return course ? this.toEntity(course) : null;
  }

  async findCourseByCode(code: string): Promise<Course | null> {
    const course = await this._model.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') } 
    }).populate('departmentId', 'name');
    return course ? this.toEntity(course) : null;
  }

  async findCoursesByDepartment(departmentId: string): Promise<Course[]> {
    const courses = await this._model.find({ departmentId }).populate('departmentId', 'name');
    return courses.map(course => this.toEntity(course));
  }

  async findCourseByName(name: string): Promise<Course | null> {
    const course = await this._model.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    }).populate('departmentId', 'name');
    return course ? this.toEntity(course) : null;
  }

  async updateCourse(id: string, course: Partial<Course>): Promise<Course | null> {
    const updatedCourse = await this._model.findByIdAndUpdate(
      id,
      { ...course, updatedAt: new Date() },
      { new: true }
    ).populate('departmentId', 'name');
    return updatedCourse ? this.toEntity(updatedCourse) : null;
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getAllCourses(): Promise<Course[]> {
    const courses = await this._model.find().populate('departmentId', 'name');
    return courses.map(course => this.toEntity(course));
  }
}