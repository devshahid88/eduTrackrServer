// src/application/useCases/TeacherUseCase.ts
import { ITeacherRepository } from "../Interfaces/ITeacher";
import Teacher from "../../domain/entities/Teacher";

export class TeacherUseCase {
    constructor(private teacherRepository: ITeacherRepository) {}

    async createTeacher(teacher: Teacher): Promise<Teacher> {
        return await this.teacherRepository.createTeacher(teacher);
    }

    async findTeacherById(id: string): Promise<Teacher | null> {
        return await this.teacherRepository.findTeacherById(id);
    }

    async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<Teacher | null> {
        return await this.teacherRepository.updateTeacher(id, teacherData);
    }

    async deleteTeacher(id: string): Promise<boolean> {
        return await this.teacherRepository.deleteTeacher(id);
    }

    async getAllTeachers(): Promise<Teacher[]> {
        return await this.teacherRepository.getAllTeachers();
    }


   async searchUsers(searchTerm: string, role: string = "Teacher"): Promise<Teacher[]> {
    try {
      return await this.teacherRepository.searchUsers(searchTerm, role);
    } catch (err: any) {
      console.error("Search Teachers Error:", err);
      throw new Error("Failed to search teachers");
    }
  }

  
}
