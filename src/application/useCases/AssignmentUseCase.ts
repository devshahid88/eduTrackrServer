import mongoose from 'mongoose';
import { Assignment, AssignmentFilters, AssignmentSubmission } from '../../domain/entities/Assignment';
import { IAssignmentRepository } from '../Interfaces/IAssignmentRepository';
import { createHttpError } from '../../common/utils/createHttpError';
import { HttpStatus } from '../../common/enums/http-status.enum';
import { HttpMessage } from '../../common/enums/http-message.enum';
import { NotificationUseCase } from './NotificationUseCase';
import { IStudentRepository } from '../Interfaces/IStudent';

export class AssignmentUseCase {
  constructor(
    private assignmentRepository: IAssignmentRepository,
    private notificationUseCase: NotificationUseCase,
    private studentRepository: IStudentRepository
  ) {}

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

    const newAssignment = await this.assignmentRepository.create(assignment);

    // Notify Students
    // We need to find students enrolled in this course.
    if (assignmentData.courseId) {
        // Ideally we need a method in StudentRepository to findByCourseId.
        // Assuming getAllStudents and filtering or better verify IStudentRepository.
        // Let's assume we can fetch all and filter for now, or add a method.
        // Looking at studentRepository.ts, there is no direct findByCourseId.
        // It has getAllStudents which populates courses.
        // We will fetch all and filter in memory for now as a quick solution, 
        // or better: utilize the search or add a method if possible (avoiding schema changes).
        const students = await this.studentRepository.getAllStudents(); 
        const enrolledStudents = students.filter(student => 
            student.courses.some((c: any) => c.courseId.toString() === assignmentData.courseId?.toString())
        );

        for (const student of enrolledStudents) {
            if (student._id) {
                await this.notificationUseCase.createNotification({
                    userId: new mongoose.Types.ObjectId(student._id.toString()),
                    userModel: 'Student',
                    type: 'assignment',
                    title: `New Assignment: ${newAssignment.title}`,
                    message: `A new assignment has been posted for your course.`,
                    read: false,
                    sender: assignmentData.teacherId ? assignmentData.teacherId.toString() : 'System',
                    senderModel: 'Teacher',
                    role: 'Student',
                    data: {
                        messageId: newAssignment.id?.toString() // using id as defined in interface
                    }
                });
            }
        }
    }

    return newAssignment;
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
    // submissionId here is actually assignmentId_studentId usually or just assignmentId?
    // Looking at controller: req.params.submissionId. 
    // Repo uses updateSubmissionGrade. 
    // Let's assume submissionId uniquely identifies or repo handles it.
    // Wait, repo.updateSubmissionGrade signature: (submissionId: string, grade: number, feedback?: string)
    // Actually in previous code: const assignment = await this.assignmentRepository.findById(submissionId.split('_')[0]);
    // This implies submissionId is composite or they are looking up assignment.
    
    // Notification Logic:
    // We need to know WHICH student got graded.
    // If submissionId is composite "assignmentId_studentId", we can parse it.
    // Or we fetch the assignment and find the submission.
    
    // Let's fetch assignment first as existing code does.
    // existing: const assignment = await this.assignmentRepository.findById(submissionId.split('_')[0]);
    
    const parts = submissionId.split('_');
    const assignmentId = parts[0];
    // This looks like a specific implementation detail. I will stick to it.
    
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      createHttpError(HttpMessage.ASSIGNMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
      // to satisfy TS compiler that assignment is not undefined below, though createHttpError throws.
      throw new Error('Assignment not found'); 
    }

    if (grade > assignment.maxMarks) {
      createHttpError(HttpMessage.GRADE_EXCEEDS_MAX, HttpStatus.BAD_REQUEST);
    }

    const updatedSubmission = await this.assignmentRepository.updateSubmissionGrade(submissionId, grade, feedback);
    
    // Notify Student
    // We need studentId. If submissionId is "assignmentId_studentId", parts[1] is studentId?
    // Let's assume yes or rely on updatedSubmission if it returns studentId.
    // AssignmentSubmission interface has studentId.
    
    if (updatedSubmission && updatedSubmission.studentId) {
         await this.notificationUseCase.createNotification({
            userId: new mongoose.Types.ObjectId(updatedSubmission.studentId.toString()),
            userModel: 'Student',
            type: 'grade',
            title: `Grade Updated: ${assignment.title}`,
            message: `You have received a new grade: ${grade}/${assignment.maxMarks}. ${feedback ? 'Feedback: ' + feedback : ''}`,
            read: false,
            sender: 'System',
            senderModel: 'Teacher',
            role: 'Student',
            data: {
                messageId: assignmentId
            }
        });
    }

    return updatedSubmission;
  }

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.assignmentRepository.getSubmissions(assignmentId);
  }

  async gradeMultipleSubmissions(assignmentId: string, grades: Array<{ studentId: string; grade: number }>): Promise<AssignmentSubmission[]> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      createHttpError(HttpMessage.ASSIGNMENT_NOT_FOUND, HttpStatus.NOT_FOUND);
      throw new Error('Assignment not found');
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
      
      // Notify Student
      await this.notificationUseCase.createNotification({
            userId: new mongoose.Types.ObjectId(gradeEntry.studentId),
            userModel: 'Student',
            type: 'grade',
            title: `Grade Updated: ${assignment.title}`,
            message: `You have received a new grade: ${gradeEntry.grade}/${assignment.maxMarks}.`,
            read: false,
            sender: 'System',
            senderModel: 'Teacher',
            role: 'Student',
            data: {
                messageId: assignmentId
            }
      });
    }

    return updatedSubmissions;
  }
}
