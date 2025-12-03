// AssignmentUseCase.ts
import { Assignment, AssignmentFilters, AssignmentSubmission } from '../../domain/entities/Assignment';
import { IAssignmentRepository } from '../Interfaces/IAssignmentRepository';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { HttpMessage } from '../../common/enums/http-message.enum';

export class AssignmentUseCase {
  constructor(private assignmentRepository: IAssignmentRepository) {}

  async createAssignment(assignmentData: Partial<Assignment>): Promise<Assignment> {
    if (!assignmentData.title || !assignmentData.description || !assignmentData.dueDate) {
      createHttpError(HttpMessage.MISSING_ASSIGNMENT_FIELDS, HttpStatus.BAD_REQUEST);
    }

    const assignment: Partial<Assignment> = {
      ...assignmentData,
      status: assignmentData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: [],
      maxGroupSize: assignmentData.isGroupAssignment ? assignmentData.maxGroupSize : 1,
      attachments: assignmentData.attachments || []
    };

    return this.assignmentRepository.create(assignment);
  }

  async getAssignments(filters?: AssignmentFilters): Promise<Assignment[]> {
    return this.assignmentRepository.findAll(filters);
  }

  async getAssignmentsByDepartment(departmentId: string): Promise<Assignment[]> {
    return this.assignmentRepository.findByDepartmentId(departmentId);
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    return this.assignmentRepository.findByTeacherId(teacherId);
  }

  async getAssignmentById(id: string): Promise<Assignment | null> {
    return this.assignmentRepository.findById(id);
  }

  async updateAssignment(id: string, assignmentData: Partial<Assignment>): Promise<Assignment> {
    if (assignmentData.dueDate && new Date(assignmentData.dueDate) < new Date()) {
      createHttpError(HttpMessage.INVALID_DUE_DATE, HttpStatus.BAD_REQUEST);
    }

    const updateData = {
      ...assignmentData,
      updatedAt: new Date()
    };

    return this.assignmentRepository.update(id, updateData);
  }

  async deleteAssignment(id: string): Promise<void> {
    return this.assignmentRepository.delete(id);
  }

  async submitAssignment(assignmentId: string, submission: AssignmentSubmission): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      createHttpError(HttpMessage.ASSIGNMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const alreadysubmitted = assignment.submissions.find(sub => sub.studentId.toString() === submission.studentId.toString());
    if (alreadysubmitted) {
      createHttpError(HttpMessage.ASSIGNMENT_ALREADY_SUBMITTED, HttpStatus.CONFLICT);
    }

    const submittedAt = submission.submittedAt || new Date();
    const isLate = submittedAt > new Date(assignment.dueDate);
    if (isLate && !assignment.allowLateSubmission) {
      createHttpError(HttpMessage.LATE_SUBMISSION_NOT_ALLOWED, HttpStatus.FORBIDDEN);
    }

    if (!submission.studentId || !submission.studentName) {
      createHttpError(HttpMessage.MISSING_STUDENT_INFO, HttpStatus.BAD_REQUEST);
    }

    if (!submission.submissionContent || (!submission.submissionContent.text && (!submission.submissionContent.files || submission.submissionContent.files.length === 0))) {
      createHttpError(HttpMessage.SUBMISSION_CONTENT_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const submissionData: AssignmentSubmission = {
      ...submission,
      assignmentId,
      submittedAt,
      isLate
    };

    return await this.assignmentRepository.addSubmission(submissionData);
  }

  async gradeSubmission(submissionId: string, grade: number, feedback?: string): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentRepository.findById(submissionId.split('_')[0]);
    if (!assignment) {
      createHttpError(HttpMessage.ASSIGNMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (grade > assignment.maxMarks) {
      createHttpError(HttpMessage.GRADE_EXCEEDS_MAX, HttpStatus.BAD_REQUEST);
    }

    return this.assignmentRepository.updateSubmissionGrade(submissionId, grade, feedback);
  }

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.assignmentRepository.getSubmissions(assignmentId);
  }

  async gradeMultipleSubmissions(assignmentId: string, grades: Array<{ studentId: string; grade: number }>): Promise<AssignmentSubmission[]> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      createHttpError(HttpMessage.ASSIGNMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const submissionMap = new Map(
      assignment.submissions.map(sub => [sub.studentId.toString(), sub])
    );

    for (const gradeEntry of grades) {
      if (!submissionMap.has(gradeEntry.studentId)) {
        createHttpError(`${HttpMessage.SUBMISSION_NOT_FOUND_FOR_STUDENT} ${gradeEntry.studentId}`, HttpStatus.NOT_FOUND);
      }
    }

    const updatedSubmissions: AssignmentSubmission[] = [];
    for (const gradeEntry of grades) {
      const submission = submissionMap.get(gradeEntry.studentId);
      if (!submission) continue;

      const submissionToUpdate = assignment.submissions.find(
        sub => sub.studentId.toString() === gradeEntry.studentId
      );
      if (!submissionToUpdate) continue;

      const updatedSubmission = await this.assignmentRepository.updateSubmissionGrade(
        submissionToUpdate.id!.toString(),
        gradeEntry.grade
      );
      updatedSubmissions.push(updatedSubmission);
    }

    return updatedSubmissions;
  }
}
