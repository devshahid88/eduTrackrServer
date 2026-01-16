import { IDepartmentRepository } from "../../application/Interfaces/IDepartmentRepository";
import { Department } from "../../domain/entities/Department";
import DepartmentModel, { IDepartmentDocument } from "../models/DepartmentModel";
import { BaseRepository } from "./BaseRepository";
import { DepartmentMapper } from "../mappers/DepartmentMapper";

import { ILogger } from "../../application/Interfaces/ILogger";

export class DepartmentRepository extends BaseRepository<Department, IDepartmentDocument> implements IDepartmentRepository {
  
  constructor(private logger: ILogger) {
    super(DepartmentModel);
  }

  protected toEntity(model: IDepartmentDocument): Department {
    return DepartmentMapper.toDomain(model);
  }

  async createDepartment(department: Department): Promise<Department> {
    return this.create(department);
  }

  async findDepartmentById(id: string): Promise<Department | null> {
    return this.findById(id);
  }

  async findDepartmentByCode(code: string): Promise<Department | null> {
    const department = await this._model.findOne({ code });
    return department ? this.toEntity(department) : null;
  }

  async findDepartmentByEmail(email: string): Promise<Department | null> {
    const department = await this._model.findOne({ departmentEmail: email });
    return department ? this.toEntity(department) : null;
  }

  async updateDepartment(id: string, department: Partial<Department>): Promise<Department | null> {
    const updatedDepartment = await this._model.findByIdAndUpdate(
      id,
      { ...department, updatedAt: new Date() },
      { new: true }
    );
    return updatedDepartment ? this.toEntity(updatedDepartment) : null;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getAllDepartments(): Promise<Department[]> {
    return this.findAll();
  }
}
