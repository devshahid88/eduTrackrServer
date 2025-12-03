import { IDepartmentRepository } from "../Interfaces/IDepartmentRepository";
import { Department } from "../../domain/entities/Department";

export class DepartmentUseCase {
    constructor(private departmentRepository: IDepartmentRepository) {}

    async createDepartment(departmentData: Partial<Department>): Promise<Department> {
        const department = Department.create(departmentData);
        return this.departmentRepository.createDepartment(department);
    }

    async getDepartmentById(id: string): Promise<Department | null> {
        return this.departmentRepository.findDepartmentById(id);
    }

    async getDepartmentByCode(code: string): Promise<Department | null> {
        return this.departmentRepository.findDepartmentByCode(code);
    }

    async getDepartmentByEmail(email: string): Promise<Department | null> {
        return this.departmentRepository.findDepartmentByEmail(email);
    }

    async updateDepartment(id: string, departmentData: Partial<Department>): Promise<Department | null> {
        return this.departmentRepository.updateDepartment(id, departmentData);
    }

    async deleteDepartment(id: string): Promise<boolean> {
        return this.departmentRepository.deleteDepartment(id);
    }

    async getAllDepartments(): Promise<Department[]> {
        return this.departmentRepository.getAllDepartments();
    }
} 