import { IAdminRepository } from "../../application/Interfaces/IAdmin";
import Admin from "../../domain/entities/Admin";
import adminModel, { IAdminDocument } from "../models/AdminModel";
import { BaseRepository } from "./BaseRepository";
import { AdminMapper } from "../mappers/AdminMapper";

export class AdminRepository extends BaseRepository<Admin, IAdminDocument> implements IAdminRepository {
    
    constructor() {
        super(adminModel);
    }

    protected toEntity(adminObj: IAdminDocument): Admin {
        return AdminMapper.toDomain(adminObj);
    }

    async createAdmin(admin: Admin): Promise<Admin> {
        return this.create(admin);
    }

    async findAdminById(id: string): Promise<Admin | null> {
        return this.findById(id);
    }

    async findAdminByEmail(email: string): Promise<Admin | null> {
        const admin = await this._model.findOne({ email });
        return admin ? this.toEntity(admin) : null;
    }

    async updateAdmin(id: string, adminData: Partial<Admin>): Promise<Admin | null> {
        return this.update(id, adminData);
    }

    async deleteAdmin(id: string): Promise<boolean> {
        return this.delete(id);
    }

    async getAllAdmins(): Promise<Admin[]> {
        return this.findAll();
    }

    async searchUsers(searchTerm: string, role: string = 'Admin'): Promise<Admin[]> {
        const query: any = {
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
        };

        if (role !== 'All') {
            query.role = role;
        }

        const admins = await this._model.find(query);
        return admins.map((admin) => this.toEntity(admin));
    }
}