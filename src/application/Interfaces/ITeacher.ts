// src/application/Interfaces/ITeacher.ts
import Teacher from "../../domain/entities/Teacher";

export interface ITeacherRepository {
    createTeacher(teacher: Teacher): Promise<Teacher>;
    findTeacherById(id: string): Promise<Teacher | null>;
    findTeacherByEmail(email: string): Promise<Teacher | null>;
    updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<Teacher | null>;
    deleteTeacher(id: string): Promise<boolean>;
    getAllTeachers(): Promise<Teacher[]>;
    searchUsers(searchTerm: string, role?: string): Promise<Teacher[]>;
    
}
