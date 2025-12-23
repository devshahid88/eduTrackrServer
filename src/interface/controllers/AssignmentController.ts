import { Request, Response, NextFunction } from 'express';
import { AssignmentUseCase } from '../../application/useCases/AssignmentUseCase';
import { AssignmentSubmission } from '../../domain/entities/Assignment';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../../infrastructure/services/cloudinary';
import { HttpStatus } from '../../common/enums/http-status.enum';

const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'assignments',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  } as any
});

const submissionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'submissions',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  } as any
});

export const assignmentUpload = multer({ storage: assignmentStorage });
export const submissionUpload = multer({ storage: submissionStorage });

export class AssignmentController {
  constructor(private assignmentUseCase: AssignmentUseCase) {}

  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const fileUrls = files ? files.map(file => file.path) : [];

      const assignmentData = {
        ...req.body,
        attachments: fileUrls,
        courseId: req.body.courseId,
        departmentId: req.body.departmentId,
        teacherId: req.body.teacherId,
        maxMarks: Number(req.body.maxMarks),
        allowLateSubmission: req.body.allowLateSubmission === 'true',
        isGroupAssignment: req.body.isGroupAssignment === 'true',
        lateSubmissionPenalty: Number(req.body.lateSubmissionPenalty) || 0,
        maxGroupSize: Number(req.body.maxGroupSize) || 1,
        dueDate: new Date(req.body.dueDate)
      };

      const assignment = await this.assignmentUseCase.createAssignment(assignmentData);

      // Trigger Notification
      // Assuming we can get students of the course/department.
      // For now, simpler approach might be needed or fan-out in UseCase like Announcement.
      // Ideally AssignmentUseCase handles this, but sticking to Controller for quick integration as planned.
      // Wait, Plan said "Inject NotificationUseCase". 
      // Actually, better to do this in UseCase to keep controller clean? 
      // Let's check AssignmentUseCase first. If it has repositories, do it there.
      // If not, doing it here requires injecting Repositories into Controller which is messy.
      
      // Checking AssignmentUseCase...
      // It likely has Repository access.
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        courseId: req.query.courseId as string,
        departmentId: req.query.departmentId as string,
        teacherId: req.query.teacherId as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string
      };

      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const assignments = await this.assignmentUseCase.getAssignments(filters);
      res.status(HttpStatus.OK).json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentsByDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await this.assignmentUseCase.getAssignmentsByDepartment(req.params.departmentId);
      res.status(HttpStatus.OK).json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentsByTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('Controller - Get Assignments by Teacher ID:', req.params.teacherId);
    try {
      const assignments = await this.assignmentUseCase.getAssignmentsByTeacher(req.params.teacherId);
      console.log('Controller - Assignments:', assignments);
      res.status(HttpStatus.OK).json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await this.assignmentUseCase.getAssignmentById(req.params.id);
      if (!assignment) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Assignment not found' });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  }

  async updateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await this.assignmentUseCase.updateAssignment(req.params.id, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: 'Assignment updated successfully', data: assignment });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.assignmentUseCase.deleteAssignment(req.params.id);
      res.status(HttpStatus.OK).json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async submitAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { studentId, studentName, submissionContent } = req.body;
      const files = req.files as Express.Multer.File[];
      const fileUrls = files ? files.map(file => file.path) : [];

      let parsedContent = submissionContent;
      if (typeof submissionContent === 'string') {
        try {
          parsedContent = JSON.parse(submissionContent);
        } catch {
          parsedContent = { text: submissionContent, files: [] };
        }
      }

      const submission: AssignmentSubmission = {
        assignmentId: id,
        studentId,
        studentName,
        submissionContent: {
          text: parsedContent.text || '',
          files: [...(parsedContent.files || []), ...fileUrls]
        },
        submittedAt: new Date()
      };

      const result = await this.assignmentUseCase.submitAssignment(id, submission);
      res.status(HttpStatus.OK).json({ success: true, message: 'Assignment submitted successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('Controller - Grade Submission for Submission ID:', req.params.submissionId);
    try {
      const { submissionId } = req.params;
      const { grade, feedback } = req.body;

      const result = await this.assignmentUseCase.gradeSubmission(submissionId, grade, feedback);
      res.status(HttpStatus.OK).json({ success: true, message: 'Grade submitted successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('Controller - Get Submissions for Assignment ID:', req.params.id);
    try {
      const submissions = await this.assignmentUseCase.getSubmissions(req.params.id);
      console.log('Controller - Submissions:', submissions);
      res.status(HttpStatus.OK).json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  async gradeMultipleSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { grades } = req.body;

      if (!Array.isArray(grades) || grades.length === 0) {
        throw new Error('Grades must be a non-empty array');
      }

      const gradesWithFeedback = grades.map(entry => ({
        studentId: entry.studentId,
        grade: Number(entry.grade),
        feedback: entry.feedback || ''
      }));

      for (const gradeEntry of gradesWithFeedback) {
        if (!gradeEntry.studentId || typeof gradeEntry.grade !== 'number') {
          throw new Error('Each grade entry must have a studentId and a numeric grade');
        }
        if (gradeEntry.grade < 0 || gradeEntry.grade > 100) {
          throw new Error('Grades must be between 0 and 100');
        }
      }

      const result = await this.assignmentUseCase.gradeMultipleSubmissions(id, gradesWithFeedback);
      res.status(HttpStatus.OK).json({ success: true, message: 'Grades submitted successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, studentId } = req.params;
      await this.assignmentUseCase.deleteSubmission(id, studentId);
      res.status(HttpStatus.OK).json({ 
        success: true, 
        message: 'Submission deleted successfully' 
      });
    } catch (error) {
      next(error);
    }
  }
}
