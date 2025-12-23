// IAssignmentRepository.ts
import { Assignment, AssignmentFilters, AssignmentSubmission } from '../../domain/entities/Assignment';

export interface IAssignmentRepository {
  create(assignment: Partial<Assignment>): Promise<Assignment>;
  findById(id: string): Promise<Assignment | null>;
  findAll(filters?: AssignmentFilters): Promise<Assignment[]>; // Made filters optional
  findByDepartmentId(departmentId: string): Promise<Assignment[]>;
  findByTeacherId(teacherId: string): Promise<Assignment[]>;
  update(id: string, assignment: Partial<Assignment>): Promise<Assignment>;
  delete(id: string): Promise<void>;
  addSubmission(submission: AssignmentSubmission): Promise<AssignmentSubmission>; // Fixed signature
  updateSubmissionGrade(submissionId: string, grade: number, feedback?: string): Promise<AssignmentSubmission>; // Fixed signature
  getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]>; // Fixed return type
  deleteSubmission(assignmentId: string, studentId: string): Promise<void>;
}