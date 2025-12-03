

export interface AssignmentSubmission {
  id?: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  isLate?: boolean;
  submissionContent: {
    text?: string;
    files: string[];
  };
  grade?: number;
  feedback?: string;
  status?: 'SUBMITTED' | 'GRADED' | 'LATE';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Assignment {
  id?: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxMarks: number;
  courseId: string;
  departmentId: string;
  teacherId: string;
  departmentName?: string;
  teacherName?: string;
  courseName?: string;
  attachments?: string[];
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
  submissionFormat?: string;
  isGroupAssignment?: boolean;
  maxGroupSize?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'active';
  submissions: AssignmentSubmission[];
  totalStudents?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssignmentFilters {
  courseId?: string;
  departmentId?: string;
  teacherId?: string;
  status?: string;
  sortBy?: string;
}
