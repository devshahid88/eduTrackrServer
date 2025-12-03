import Admin from "../../domain/entities/Admin";

export interface IAdminRepository {
    createAdmin(admin: Admin): Promise<Admin>;
    findAdminById(id: string): Promise<Admin | null>;
    findAdminByEmail(email: string): Promise<Admin | null>;
    updateAdmin(id: string, adminData: Partial<Admin>): Promise<Admin | null>;
    deleteAdmin(id: string): Promise<boolean>;
    getAllAdmins(): Promise<Admin[]>;
    searchUsers(searchTerm: string, role?: string): Promise<Admin[]>;
}