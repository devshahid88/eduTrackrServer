import { Department } from "../../domain/entities/Department";

export interface IDepartmentRepository {
    createDepartment(department: Department): Promise<Department>;
    findDepartmentById(id: string): Promise<Department | null>;
    findDepartmentByCode(code: string): Promise<Department | null>;
    findDepartmentByEmail(email: string): Promise<Department | null>;
    updateDepartment(id: string, department: Partial<Department>): Promise<Department | null>;
    deleteDepartment(id: string): Promise<boolean>;
    getAllDepartments(): Promise<Department[]>;
} 