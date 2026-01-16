import { IAssignmentRepository } from '../../application/Interfaces/IAssignmentRepository';
import { Assignment, AssignmentFilters, AssignmentSubmission } from '../../domain/entities/Assignment';
import AssignmentModel, { IAssignmentDocument } from '../models/Assignment';
import mongoose from 'mongoose';
import { BaseRepository } from "./BaseRepository";
import { AssignmentMapper } from "../mappers/AssignmentMapper";

import { ILogger } from '../../application/Interfaces/ILogger';

export class AssignmentRepository extends BaseRepository<Assignment, IAssignmentDocument> implements IAssignmentRepository {

  constructor(private logger: ILogger) {
    super(AssignmentModel);
  }

  protected toEntity(model: IAssignmentDocument): Assignment {
    return AssignmentMapper.toDomain(model);
  }

  // Populate helper
  private get populateQuery() {
    return [
      { path: 'departmentId', select: 'name' },
      { path: 'teacherId', select: 'username firstname lastname' },
      { path: 'courseId', select: 'name' }
    ];
  }

  async create(assignment: Partial<Assignment>): Promise<Assignment> {
    this.logger.info(`Repository - Creating assignment with data: ${JSON.stringify(assignment)}`);
    const attachments = Array.isArray(assignment.attachments) ? assignment.attachments : [];
    
    // Manual creation because Input Partial<Assignment> doesn't perfectly match Mongoose Model
    const newAssignment = await AssignmentModel.create({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
      courseId: new mongoose.Types.ObjectId(assignment.courseId),
      departmentId: new mongoose.Types.ObjectId(assignment.departmentId),
      teacherId: new mongoose.Types.ObjectId(assignment.teacherId),
      attachments: attachments,
      allowLateSubmission: assignment.allowLateSubmission,
      lateSubmissionPenalty: assignment.lateSubmissionPenalty,
      submissionFormat: assignment.submissionFormat,
      isGroupAssignment: assignment.isGroupAssignment,
      maxGroupSize: assignment.maxGroupSize,
      status: assignment.status || 'active'
    });
    
    return this.toEntity(newAssignment);
  }

  async findById(id: string): Promise<Assignment | null> {
    const assignment = await this._model.findById(id).populate(this.populateQuery);
    return assignment ? this.toEntity(assignment) : null;
  }

  async findAll(filters?: AssignmentFilters): Promise<Assignment[]> {
    let query: any = {};
    
    if (filters) {
      if (filters.courseId) query.courseId = new mongoose.Types.ObjectId(filters.courseId);
      if (filters.departmentId) query.departmentId = new mongoose.Types.ObjectId(filters.departmentId);
      if (filters.teacherId) query.teacherId = new mongoose.Types.ObjectId(filters.teacherId);
      if (filters.status) query.status = filters.status;
    }

    let assignmentQuery = this._model.find(query).populate(this.populateQuery);

    if (filters?.sortBy) {
      assignmentQuery = assignmentQuery.sort(filters.sortBy);
    }
    
    const assignments = await assignmentQuery;                  
    return assignments.map(assignment => this.toEntity(assignment));
  }

  async findByDepartmentId(departmentId: string): Promise<Assignment[]> {
    const assignments = await this._model.find({ departmentId: new mongoose.Types.ObjectId(departmentId) })
      .populate(this.populateQuery);
    return assignments.map(assignment => this.toEntity(assignment));
  }

  async findByTeacherId(teacherId: string): Promise<Assignment[]> {
    const assignments = await this._model.find({ teacherId: new mongoose.Types.ObjectId(teacherId) })
      .populate(this.populateQuery);
    return assignments.map(assignment => this.toEntity(assignment));
  }

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    // Note: Mongoose update logic might need explicit field handling if assignment object is complex
    const updatedAssignment = await this._model.findByIdAndUpdate(
      id,
      { ...assignment, updatedAt: new Date() },
      { new: true }
    ).populate(this.populateQuery);
    
    if (!updatedAssignment) {
      throw new Error('Assignment not found');
    }
    
    return this.toEntity(updatedAssignment);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this._model.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Assignment not found');
    }
    return true;
  }

  async addSubmission(submission: AssignmentSubmission): Promise<AssignmentSubmission> {
    const assignment = await this._model.findById(submission.assignmentId);
    
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const submittedAt = submission.submittedAt || new Date();
    // Assuming assignment.dueDate is a Date object, if not, parse it.
    const isLate = new Date(submittedAt) > new Date(assignment.dueDate);

    const files = Array.isArray(submission.submissionContent?.files) 
      ? submission.submissionContent.files 
      : [];
    
    const submissionData = {
      studentId: new mongoose.Types.ObjectId(submission.studentId),
      studentName: submission.studentName,
      submittedAt,
      isLate,
      submissionContent: {
        text: submission.submissionContent?.text || '',
        files: files 
      }
    };

    // Cast to any to bypass strict type check for now if ISubmission interface is strict
    assignment.submissions.push(submissionData as any);
    assignment.totalStudents = assignment.submissions.length;
    
    await assignment.save();
    
    const newSubmission = assignment.submissions[assignment.submissions.length - 1];
    return AssignmentMapper.toSubmissionDomain({
      ...JSON.parse(JSON.stringify(newSubmission)),
      _id: newSubmission._id, // Use _id here as it comes from mongo
      assignmentId: assignment._id
    });
  }

  async updateSubmissionGrade(submissionId: string, grade: number, feedback?: string): Promise<AssignmentSubmission> {
    const assignment = await this._model.findOne({
      'submissions._id': submissionId
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }


    
    const submission = assignment.submissions.find(sub => sub._id?.toString() === submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    submission.grade = grade;
    if (feedback) {
      submission.feedback = feedback;
    }
    
    await assignment.save();
    
    return AssignmentMapper.toSubmissionDomain({
      ...JSON.parse(JSON.stringify(submission)),
      _id: submission._id,
      assignmentId: assignment._id
    });
  }

  async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const assignment = await this._model.findById(assignmentId);
    
    if (!assignment) {
      return [];
    }
    
    return assignment.submissions.map(submission => 
      AssignmentMapper.toSubmissionDomain({
        ...JSON.parse(JSON.stringify(submission)),
        _id: submission._id,
        assignmentId: assignment._id
      })
    );
  }

  async deleteSubmission(assignmentId: string, studentId: string): Promise<void> {
    const result = await this._model.findByIdAndUpdate(
      assignmentId,
      { 
        $pull: { submissions: { studentId: new mongoose.Types.ObjectId(studentId) } },
        $inc: { totalStudents: -1 }
      },
      { new: true }
    );

    if (!result) {
      throw new Error('Assignment not found or submission not deleted');
    }
  }
}