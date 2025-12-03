class Admin {
    public readonly id?: string;
    public username!: string;
    public firstname!: string;
    public lastname!: string;
    public email!: string;
    public password!: string;
    public profileImage?: string;
    public role: 'Admin';

    constructor(data: Partial<Admin>) {
        this.id = data.id;
        this.username = data.username ?? '';
        this.firstname = data.firstname ?? '';
        this.lastname = data.lastname ?? '';
        this.email = data.email ?? '';
        this.password = data.password ?? '';
        this.profileImage = data.profileImage;
        this.role = 'Admin'; // default role
    }
}

export default Admin;