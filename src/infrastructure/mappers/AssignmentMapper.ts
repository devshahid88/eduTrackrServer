import { Assignment, AssignmentSubmission } from "../../domain/entities/Assignment";
import { IAssignmentDocument } from "../models/Assignment";

export class AssignmentMapper {
  static toDomain(data: any | IAssignmentDocument): Assignment {
    return {
      _id: data._id.toString(),
      id: data._id.toString(),
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      dueDate: data.dueDate,
      maxMarks: data.maxMarks,
      courseId: data.courseId?._id?.toString() || data.courseId?.toString() || '',
      departmentId: data.departmentId?._id?.toString() || data.departmentId?.toString() || '',
      teacherId: data.teacherId?._id?.toString() || data.teacherId?.toString() || '',
      departmentName: data.departmentId?.name || undefined,
      teacherName: (data.teacherId?.firstname && data.teacherId?.lastname) 
        ? `${data.teacherId.firstname} ${data.teacherId.lastname}` 
        : (data.teacherId?.username || undefined),
      courseName: data.courseId?.name || undefined,
      attachments: data.attachments || [],
      allowLateSubmission: data.allowLateSubmission,
      lateSubmissionPenalty: data.lateSubmissionPenalty,
      submissionFormat: data.submissionFormat,
      isGroupAssignment: data.isGroupAssignment,
      maxGroupSize: data.maxGroupSize,
      status: data.status,
      submissions: data.submissions?.map((sub: any) => AssignmentMapper.toSubmissionDomain({
        ...sub.toObject ? sub.toObject() : sub,
        assignmentId: data._id.toString()
      })) || [],
      totalStudents: data.totalStudents,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  static toSubmissionDomain(data: any): AssignmentSubmission {
    return {
      _id: data._id?.toString() || data.id,
      id: data._id?.toString() || data.id,
      assignmentId: data.assignmentId?.toString(),
      studentId: data.studentId?.toString() || '',
      studentName: data.studentName || 'Unknown',
      submittedAt: data.submittedAt,
      isLate: data.isLate,
      submissionContent: data.submissionContent || { text: '', files: [] },
      grade: data.grade,
      feedback: data.feedback
    };
  }
}
