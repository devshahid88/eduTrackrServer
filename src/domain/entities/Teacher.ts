// src/domain/entities/Teacher.ts

class Teacher {
    public readonly id?: string;
    public username: string;
    public email: string;
    public firstname: string;
    public lastname: string;
    public password: string;
    public profileImage?: string;
    public department: string;
    public departmentName?: string;
    public role: 'Teacher'; // Always Teacher
  
    constructor(data: Partial<Teacher>) {
      this.id = data.id;
      this.username = data.username ?? '';
      this.firstname = data.firstname ?? '';
      this.lastname = data.lastname ?? '';
      this.email = data.email ?? '';
      this.password = data.password ?? '';
      this.profileImage = data.profileImage;
      this.department = data.department ?? '';
      this.departmentName = data.departmentName;
      this.role = 'Teacher';
    }
  }
  
  export default Teacher;
  