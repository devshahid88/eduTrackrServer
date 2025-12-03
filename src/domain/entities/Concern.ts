// domain/entities/Concern.ts
export enum ConcernStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  SOLVED = 'solved',
}


export enum ConcernType {
  ACADEMIC = 'Academic',
  ADMINISTRATIVE = 'Administrative'
}

export interface User {
  _id: string;
  username: string;
  role: 'Student' | 'Teacher' | 'Admin';
}

export class Concern {
  public id: string;
  public title: string;
  public description: string;
  public type: ConcernType;
  public status: ConcernStatus;
  public createdBy: User | string; // Can be populated User object or ObjectId string
  public createdByRole: 'Student' | 'Teacher' | 'Admin';
  public feedback?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: any) {
    this.id = data.id || data._id;
    this.title = data.title;
    this.description = data.description;
    this.type = data.type;
    this.status = data.status;
    this.createdBy = data.createdBy;
    this.createdByRole = data.createdByRole;
    this.feedback = data.feedback;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Helper method to get user details
  public getCreatedByUser(): User | null {
    if (typeof this.createdBy === 'object' && this.createdBy !== null) {
      return this.createdBy as User;
    }
    return null;
  }

  // Helper method to get username
  public getCreatedByUsername(): string {
    const user = this.getCreatedByUser();
    return user ? user.username : 'Unknown';
  }

  // Helper method to get user role
  public getCreatedByRole(): string {
    const user = this.getCreatedByUser();
    return user ? user.role : this.createdByRole || 'Unknown';
  }
}