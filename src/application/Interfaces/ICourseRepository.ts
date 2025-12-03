import { Course } from "../../domain/entities/Course";

export interface ICourseRepository {
    createCourse(course: Course): Promise<Course>;
    findCourseById(id: string): Promise<Course | null>;
    findCourseByCode(code: string): Promise<Course | null>;
    findCoursesByDepartment(departmentId: string): Promise<Course[]>;
    findCourseByName(name: string): Promise<Course | null>;
    updateCourse(id: string, course: Partial<Course>): Promise<Course | null>;
    deleteCourse(id: string): Promise<boolean>;
    getAllCourses(): Promise<Course[]>;
} 