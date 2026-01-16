export class Resource {
    constructor(
        public title: string,
        public description: string,
        public type: 'pdf' | 'video' | 'link',
        public url: string,
        public role: 'Teacher' | 'Student' | 'Admin',
        public uploadedBy: string,
        public createdAt: Date = new Date(),
        public courseId?: string,
        public _id?: string
    ) {}

    static create(data: Partial<Resource>): Resource {
        return new Resource(
            data.title || '',
            data.description || '',
            data.type || 'link',
            data.url || '',
            data.role || 'Admin',
            data.uploadedBy || '',
            data.createdAt || new Date(),
            data.courseId,
            data._id
        );
    }
}
