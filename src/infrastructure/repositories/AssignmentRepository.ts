// AssignmentRepository.ts

import { IAssignmentRepository } from '../../application/Interfaces/IAssignmentRepository';
import { Assignment, AssignmentFilters, AssignmentSubmission } from '../../domain/entities/Assignment';
import AssignmentModel from '../models/Assignment';
import mongoose from 'mongoose';

function mapToAssignmentEntity(data: any): Assignment {
  return {
    ...data,
    id: data._id.toString(),
    departmentId: data.departmentId?._id?.toString() || data.departmentId?.toString(),
    teacherId: data.teacherId?._id?.toString() || data.teacherId?.toString(),
    courseId: data.courseId?._id?.toString() || data.courseId?.toString(),
    departmentName: data.departmentId?.name || undefined,
    teacherName: data.teacherId?.username || undefined,
    courseName: data.courseId?.name || undefined,
    submissions: data.submissions?.map((sub: any) => mapToSubmissionEntity({
      ...sub.toObject ? sub.toObject() : sub,
      assignmentId: data._id.toString()
    })) || []
  };
}

function mapToSubmissionEntity(data: any): AssignmentSubmission {
  return {
    ...data,
    id: data._id?.toString() || data.id,
    assignmentId: data.assignmentId?.toString(),
    studentId: data.studentId?.toString(),
    studentName: data.studentName,
    submittedAt: data.submittedAt,
    isLate: data.isLate,
    submissionContent: data.submissionContent || { text: '', files: [] },
    grade: data.grade,
    feedback: data.feedback
  };
}

export class AssignmentRepository implements IAssignmentRepository {
  async create(assignment: Partial<Assignment>): Promise<Assignment> {
    console.log('Repository - Creating assignment with data:', assignment);
    
    // Ensure attachments is an array of Cloudinary URLs
    const attachments = Array.isArray(assignment.attachments) ? assignment.attachments : [];
    console.log('Repository - Attachments to save:', attachments);

    const newAssignment = await AssignmentModel.create({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
      courseId: new mongoose.Types.ObjectId(assignment.courseId),
      departmentId: new mongoose.Types.ObjectId(assignment.departmentId),
      teacherId: new mongoose.Types.ObjectId(assignment.teacherId),
      attachments: attachments, // Save Cloudinary URLs
      allowLateSubmission: assignment.allowLateSubmission,
      lateSubmissionPenalty: assignment.lateSubmissionPenalty,
      submissionFormat: assignment.submissionFormat,
      isGroupAssignment: assignment.isGroupAssignment,
      maxGroupSize: assignment.maxGroupSize,
      status: assignment.status || 'active'
    });

    console.log('Repository - Created assignment:', newAssignment);
    
    return mapToAssignmentEntity(newAssignment.toObject());
  }

  async findById(id: string): Promise<Assignment | null> {
    const assignment = await AssignmentModel.findById(id)
      .populate('departmentId', 'name')
      .populate('teacherId','username')
      .populate('courseId', 'name');
    
    return assignment ? mapToAssignmentEntity(assignment.toObject()) : null;
  }

  async findAll(filters?: AssignmentFilters): Promise<Assignment[]> {
    let query: any = {};
    
    if (filters) {
      if (filters.courseId) query.courseId = new mongoose.Types.ObjectId(filters.courseId);
      if (filters.departmentId) query.departmentId = new mongoose.Types.ObjectId(filters.departmentId);
      if (filters.teacherId) query.teacherId = new mongoose.Types.ObjectId(filters.teacherId);
      if (filters.status) query.status = filters.status;
    }

    let assignmentQuery = AssignmentModel.find(query)
      .populate('departmentId', 'name')
      .populate('teacherId','username')
      .populate('courseId', 'name');

    if (filters?.sortBy) {
      assignmentQuery = assignmentQuery.sort(filters.sortBy);
    }
    
    const assignments = await assignmentQuery;                  
    return assignments.map(assignment => mapToAssignmentEntity(assignment.toObject()));
  }

  async findByDepartmentId(departmentId: string): Promise<Assignment[]> {
    const assignments = await AssignmentModel.find({ departmentId: new mongoose.Types.ObjectId(departmentId) })
      .populate('departmentId', 'name')
       .populate('teacherId','username')
      .populate('courseId', 'name');
    
    return assignments.map(assignment => mapToAssignmentEntity(assignment.toObject()));
  }

  async findByTeacherId(teacherId: string): Promise<Assignment[]> {
    const assignments = await AssignmentModel.find({ teacherId: new mongoose.Types.ObjectId(teacherId) })
      .populate('departmentId', 'name')
       .populate('teacherId','username')
      .populate('courseId', 'name');
    
    return assignments.map(assignment => mapToAssignmentEntity(assignment.toObject()));
  }

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
      id,
      { ...assignment, updatedAt: new Date() },
      { new: true }
    )
      .populate('departmentId', 'name')
       .populate('teacherId','username')
      .populate('courseId', 'name');
    
    if (!updatedAssignment) {
      throw new Error('Assignment not found');
    }
    
    return mapToAssignmentEntity(updatedAssignment.toObject());
  }

  async delete(id: string): Promise<void> {
    const result = await AssignmentModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Assignment not found');
    }
  }

  async addSubmission(submission: AssignmentSubmission): Promise<AssignmentSubmission> {
    const assignment = await AssignmentModel.findById(submission.assignmentId);
    
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const submittedAt = submission.submittedAt || new Date();
    const isLate = new Date(submittedAt) > new Date(assignment.dueDate);

    // Ensure files is an array of Cloudinary URLs
    const files = Array.isArray(submission.submissionContent?.files) 
      ? submission.submissionContent.files 
      : [];
    
    console.log('Repository - Adding submission with files:', files);

    const submissionData = {
      studentId: new mongoose.Types.ObjectId(submission.studentId),
      studentName: submission.studentName,
      submittedAt,
      isLate,
      submissionContent: {
        text: submission.submissionContent?.text || '',
        files: files // Save Cloudinary URLs
      }
    };

    assignment.submissions.push(submissionData);
    assignment.totalStudents = assignment.submissions.length;
    
    await assignment.save();
    
    const newSubmission = assignment.submissions[assignment.submissions.length - 1];
    return mapToSubmissionEntity({
      // Convert mongoose document to plain object
      ...JSON.parse(JSON.stringify(newSubmission)),
      _id: newSubmission._id,
      assignmentId: assignment._id
    });
  }

  async updateSubmissionGrade(submissionId: string, grade: number, feedback?: string): Promise<AssignmentSubmission> {
    const assignment = await AssignmentModel.findOne({
      'submissions._id': submissionId
    });

    // Fix: Add null check for assignment
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Fix: Correct the typo from 'submiited' to 'SUBMITTED'
    if (assignment.status === 'SUBMITTED') {
      throw new Error('Assignment already submitted');
    }
    
    // Fix: Use find() method instead of id() method
    const submission = assignment.submissions.find(sub => sub._id?.toString() === submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    submission.grade = grade;
    if (feedback) {
      submission.feedback = feedback;
    }
    
    await assignment.save();
    
    return mapToSubmissionEntity({
      // Convert mongoose document to plain object
      ...JSON.parse(JSON.stringify(submission)),
      _id: submission._id,
      assignmentId: assignment._id
    });
  }

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const assignment = await AssignmentModel.findById(assignmentId);
    
    if (!assignment) {
      return [];
    }
    
    return assignment.submissions.map(submission => 
      mapToSubmissionEntity({
        // Convert mongoose document to plain object
        ...JSON.parse(JSON.stringify(submission)),
        _id: submission._id,
        assignmentId: assignment._id
      })
    );
  }
}