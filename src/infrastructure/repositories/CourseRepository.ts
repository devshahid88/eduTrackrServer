import { ICourseRepository } from "../../application/Interfaces/ICourseRepository";
import { Course } from "../../domain/entities/Course";
import CourseModel from "../models/CourseModel";

function mapToCourseEntity(data: any): Course {
  return Course.create({
    ...data,
    _id: data._id.toString(),
    departmentId: data.departmentId?._id?.toString() || data.departmentId?.toString(),
    departmentName: data.departmentId?.name || undefined,
  });
}

export class CourseRepository implements ICourseRepository {
  async createCourse(course: Course): Promise<Course> {
    const newCourse = await CourseModel.create(course);
    return mapToCourseEntity(newCourse.toObject());
  }

  async findCourseById(id: string): Promise<Course | null> {
    const course = await CourseModel.findById(id).populate('departmentId', 'name');
    return course ? mapToCourseEntity(course.toObject()) : null;
  }

  async findCourseByCode(code: string): Promise<Course | null> {
    const course = await CourseModel.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') } 
    }).populate('departmentId', 'name');
    return course ? mapToCourseEntity(course.toObject()) : null;
  }

  async findCoursesByDepartment(departmentId: string): Promise<Course[]> {
    const courses = await CourseModel.find({ departmentId }).populate('departmentId', 'name');
    return courses.map(course => mapToCourseEntity(course.toObject()));
  }

  async findCourseByName(name: string): Promise<Course | null> {
    const course = await CourseModel.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    }).populate('departmentId', 'name');
    return course ? mapToCourseEntity(course.toObject()) : null;
  }

  async updateCourse(id: string, course: Partial<Course>): Promise<Course | null> {
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      { ...course, updatedAt: new Date() },
      { new: true }
    ).populate('departmentId', 'name');
    return updatedCourse ? mapToCourseEntity(updatedCourse.toObject()) : null;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await CourseModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllCourses(): Promise<Course[]> {
    const courses = await CourseModel.find().populate('departmentId', 'name');
    return courses.map(course => mapToCourseEntity(course.toObject()));
  }
}