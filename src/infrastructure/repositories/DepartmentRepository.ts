import { IDepartmentRepository } from "../../application/Interfaces/IDepartmentRepository";
import { Department } from "../../domain/entities/Department";
import DepartmentModel from "../models/DepartmentModel";

function mapToDepartmentEntity(data: any): Department {
  return Department.create({
    ...data,
    _id: data._id.toString(),
  });
}

export class DepartmentRepository implements IDepartmentRepository {
  async createDepartment(department: Department): Promise<Department> {
    const newDepartment = await DepartmentModel.create(department);
    return mapToDepartmentEntity(newDepartment.toObject());
  }

  async findDepartmentById(id: string): Promise<Department | null> {
    const department = await DepartmentModel.findById(id);
    return department ? mapToDepartmentEntity(department.toObject()) : null;
  }

  async findDepartmentByCode(code: string): Promise<Department | null> {
    const department = await DepartmentModel.findOne({ code });
    return department ? mapToDepartmentEntity(department.toObject()) : null;
  }

  async findDepartmentByEmail(email: string): Promise<Department | null> {
    const department = await DepartmentModel.findOne({ departmentEmail: email });
    return department ? mapToDepartmentEntity(department.toObject()) : null;
  }

  async updateDepartment(id: string, department: Partial<Department>): Promise<Department | null> {
    const updatedDepartment = await DepartmentModel.findByIdAndUpdate(
      id,
      { ...department, updatedAt: new Date() },
      { new: true }
    );
    return updatedDepartment ? mapToDepartmentEntity(updatedDepartment.toObject()) : null;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await DepartmentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllDepartments(): Promise<Department[]> {
    const departments = await DepartmentModel.find();
    return departments.map(department => mapToDepartmentEntity(department.toObject()));
  }
}
