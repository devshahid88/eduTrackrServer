export interface AssignmentSubmission {
  id?: string;
  assignmentId: string;
  studentId: string;
  files: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  createdAt?: Date;
  updatedAt?: Date;
} 