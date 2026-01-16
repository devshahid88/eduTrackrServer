export class Announcement {
    constructor(
        public title: string,
        public message: string,
        public targetRoles: string[],
        public createdBy: string,
        public createdAt: Date,
        public courseId?: string,
        public _id?: string
    ) {}

    static create(data: Partial<Announcement>): Announcement {
        return new Announcement(
            data.title || '',
            data.message || '',
            data.targetRoles || [],
            data.createdBy || '',
            data.createdAt || new Date(),
            data.courseId,
            data._id
        );
    }
}
