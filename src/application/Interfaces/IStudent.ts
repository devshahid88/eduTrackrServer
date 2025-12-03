import Student from '../../domain/entities/Student';

export interface IStudentRepository {
  createStudent(student: Student): Promise<Student>;
  findStudentById(id: string): Promise<Student | null>;
  findStudentByEmail(email: string): Promise<Student | null>;
  updateStudent(id: string, studentData: Partial<Student>): Promise<Student | null>;
  deleteStudent(id: string): Promise<boolean>;
  getAllStudents(): Promise<Student[]>;
  searchUsers(searchTerm: string, role?: string): Promise<Student[]>;
}
