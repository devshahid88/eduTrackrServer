import Student from '../../domain/entities/Student';
import Admin from '../../domain/entities/Admin';
import Teacher from '../../domain/entities/Teacher';
export interface IAuthRepository {
    findStudentByEmail(email: string): Promise<Student | null>;
    findAdminByEmail(email: string): Promise<Admin | null>;
    findTeacherByEmail(email: string): Promise<Teacher | null>;
    updatePasswordByEmail(email: string, newHashedPassword: string): Promise<boolean>;
    saveResetTokenByEmail(email: string,token: string,expiresAt: Date): Promise<void>;
    validateResetToken(email: string, token: string): Promise<boolean>;
    clearResetToken(email: string): Promise<void>;
} 