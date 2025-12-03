import { ICourseRepository } from '../Interfaces/ICourseRepository';
import { Course } from '../../domain/entities/Course';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { CourseMessage } from '../../common/enums/http-message.enum';

export class CourseUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    if (!courseData.name || courseData.name.trim() === '') {
      createHttpError(CourseMessage.COURSE_NAME_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    if (!courseData.code || courseData.code.trim() === '') {
      createHttpError(CourseMessage.COURSE_CODE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const existingCourseByName = await this.courseRepository.findCourseByName(courseData.name.trim());
    if (existingCourseByName) {
      createHttpError(CourseMessage.COURSE_NAME_EXISTS, HttpStatus.CONFLICT);
    }

    const existingCourseByCode = await this.courseRepository.findCourseByCode(courseData.code.trim());
    if (existingCourseByCode) {
      createHttpError(CourseMessage.COURSE_CODE_EXISTS, HttpStatus.CONFLICT);
    }

    const course = Course.create(courseData);
    return this.courseRepository.createCourse(course);
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
    if (courseData.name && courseData.name.trim() !== '') {
      const existingCourseByName = await this.courseRepository.findCourseByName(courseData.name.trim());
      if (existingCourseByName && existingCourseByName._id !== id) {
        createHttpError(CourseMessage.COURSE_NAME_EXISTS, HttpStatus.CONFLICT);
      }
    }

    if (courseData.code && courseData.code.trim() !== '') {
      const existingCourseByCode = await this.courseRepository.findCourseByCode(courseData.code.trim());
      if (existingCourseByCode && existingCourseByCode._id !== id) {
        createHttpError(CourseMessage.COURSE_CODE_EXISTS, HttpStatus.CONFLICT);
      }
    }

    const sanitizedData = {
      ...courseData,
      ...(courseData.name && { name: courseData.name.trim() }),
      ...(courseData.code && { code: courseData.code.trim() }),
      ...(courseData.departmentId && { departmentId: courseData.departmentId.trim() }),
      ...(courseData.departmentName && { departmentName: courseData.departmentName.trim() }),
      updatedAt: new Date(),
    };

    return this.courseRepository.updateCourse(id, sanitizedData);
  }

  async getCourseById(id: string): Promise<Course | null> {
    if (!id || id.trim() === '') {
      createHttpError(CourseMessage.COURSE_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    return this.courseRepository.findCourseById(id.trim());
  }

  async getCourseByCode(code: string): Promise<Course | null> {
    if (!code || code.trim() === '') {
      createHttpError(CourseMessage.COURSE_CODE_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    return this.courseRepository.findCourseByCode(code.trim());
  }

  async getCourseByName(name: string): Promise<Course | null> {
    if (!name || name.trim() === '') {
      createHttpError(CourseMessage.COURSE_NAME_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    return this.courseRepository.findCourseByName(name.trim());
  }

  async getCoursesByDepartment(departmentId: string): Promise<Course[]> {
    if (!departmentId || departmentId.trim() === '') {
      createHttpError(CourseMessage.DEPARTMENT_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    return this.courseRepository.findCoursesByDepartment(departmentId.trim());
  }

  async deleteCourse(id: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      createHttpError(CourseMessage.COURSE_ID_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const course = await this.courseRepository.findCourseById(id.trim());
    if (!course) {
      createHttpError(CourseMessage.COURSE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return this.courseRepository.deleteCourse(id.trim());
  }

  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.getAllCourses();
  }
}
