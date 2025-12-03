// core/domain/entities/Course.ts

export class Course {
    constructor(
        public name: string,
        public code: string,
        public departmentId: string,
        public semester: number,
        public active: boolean = true,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public departmentName?: string,
        public _id?: string
    ) {}

    static create(data: Partial<Course>): Course {
        return new Course(
            data.name || '',
            data.code || '',
            data.departmentId || '',
            data.semester || 1,
            data.active,
            data.createdAt,
            data.updatedAt,
            data.departmentName,
            data._id
        );
    }
}
  