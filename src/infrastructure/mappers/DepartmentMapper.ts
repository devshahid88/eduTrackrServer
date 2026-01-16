import { Department } from "../../domain/entities/Department";
import { IDepartmentDocument } from "../models/DepartmentModel";

export class DepartmentMapper {
  static toDomain(doc: IDepartmentDocument): Department {
    return Department.create({
      _id: (doc._id as unknown as string).toString(),
      name: doc.name,
      code: doc.code,
      establishedDate: doc.establishedDate,
      headOfDepartment: doc.headOfDepartment,
      departmentEmail: doc.departmentEmail,
      departmentPhone: doc.departmentPhone,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      active: doc.active
    });
  }
}
