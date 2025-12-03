export class Department {
    constructor(
        public name: string,
        public code: string,
        public establishedDate: Date,
        public headOfDepartment: string,
        public departmentEmail: string,
        public departmentPhone: string,
        public active: boolean = true,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public _id?: string
    ) {}

    static create(data: Partial<Department>): Department {
        return new Department(
            data.name || '',
            data.code || '',
            data.establishedDate || new Date(),
            data.headOfDepartment || '',
            data.departmentEmail || '',
            data.departmentPhone || '',
            data.active,
            data.createdAt,
            data.updatedAt,
            data._id
        );
    }
} 