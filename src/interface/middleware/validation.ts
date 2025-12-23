import { Request, Response, NextFunction } from 'express';
import { StudentRepository } from '../../infrastructure/repositories/studentRepository';
import { TeacherRepository } from '../../infrastructure/repositories/TeacherRepository';
import { AdminRepository } from '../../infrastructure/repositories/AdminRepository';
import { isValidObjectId } from 'mongoose';
import { Types } from 'mongoose';

export const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
    // Get the ID from either teacherId or id parameter
   const id = req.params.teacherId || 
               req.params.departmentId || 
               req.params.studentId || 
               req.params.courseId || 
               req.params.id;
    
    console.log('Validating ID:', id);
    
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No ID provided'
        });
    }

    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    
    next();
};

export const validateUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, username, password, role } = req.body;
        const errors: string[] = [];
        if (!email) errors.push('Email is required');
        if (!username) errors.push('Username is required');
        if (!password) errors.push('Password is required');
        if (!role) errors.push('Role is required');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format12345');
        }
        if (password && password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        if (role && !['Student', 'Teacher', 'Admin'].includes(role)) {
            errors.push('Invalid role specified');
        }
       
        const studentRepo = new StudentRepository();
        const teacherRepo = new TeacherRepository();
        const adminRepo = new AdminRepository();
    
        const existingStudent = await studentRepo.findStudentByEmail(email);
        const existingTeacher = await teacherRepo.findTeacherByEmail(email);
        const existingAdmin = await adminRepo.findAdminByEmail(email);
        
        if (existingStudent || existingTeacher || existingAdmin ) {
            errors.push('Email already exists');
        }
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0], 
                errors
            });
        }
        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};



export const validateUserUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const errors: string[] = [];

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }

        if (email) {
            const studentRepo = new StudentRepository();
            const teacherRepo = new TeacherRepository();
            const adminRepo = new AdminRepository();

            const [existingStudent, existingTeacher, existingAdmin] = await Promise.all([
                studentRepo.findStudentByEmail(email),
                teacherRepo.findTeacherByEmail(email),
                adminRepo.findAdminByEmail(email)
            ]);

            const isEmailUsedByAnotherUser =
                (existingStudent && String(existingStudent._id) !== id) ||
                (existingTeacher && String(existingTeacher.id) !== id) ||
                (existingAdmin && String(existingAdmin.id) !== id);

            if (isEmailUsedByAnotherUser) {
                errors.push('Email already exists');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors
            });
        }
        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};

export const validateLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const errors: string[] = [];

        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors
            });
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};





export const validateProfileImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const errors: string[] = [];


        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

  
        if (!req.file) {
            errors.push('No image file uploaded');
        } else {
         
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                errors.push('Invalid file type. Only JPEG, JPG, and PNG are allowed');
            }


            const maxSize = 5 * 1024 * 1024; // 5MB
            if (req.file.size > maxSize) {
                errors.push('File size exceeds 5MB limit');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors
            });
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};

export const validateAssignment = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, dueDate, maxMarks, courseId, departmentId } = req.body;

  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }

  if (!dueDate || isNaN(Date.parse(dueDate))) {
    errors.push('Valid due date is required');
  } else if (new Date(dueDate) < new Date()) {
    errors.push('Due date cannot be in the past');
  }

  if (!maxMarks || typeof maxMarks !== 'number' || maxMarks < 1) {
    errors.push('Maximum marks must be a positive number');
  }

  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    errors.push('Valid course ID is required');
  }

  if (!departmentId || !Types.ObjectId.isValid(departmentId)) {
    errors.push('Valid department ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateSubmission = (req: Request, res: Response, next: NextFunction) => {
  const { studentId, hasSubmissionText, fileCount, fileNames, studentName, submissionText } = req.body;
  const files = req.files as Express.Multer.File[];

  console.log('Submission validation - Request body:', req.body);
  console.log('Submission validation - Files:', files);

  const errors: string[] = [];

  if (!studentId || !Types.ObjectId.isValid(studentId)) {
    errors.push('Valid student ID is required');
  }

  if (!studentName || typeof studentName !== 'string' || studentName.trim().length === 0) {
    errors.push('Student name is required');
  }

  // Check if there's either text submission or files
  const hasTextSubmission = hasSubmissionText && submissionText && submissionText.trim().length > 0;
  const hasFileSubmission = files && files.length > 0;

  if (!hasTextSubmission && !hasFileSubmission) {
    errors.push('Either submission text or files are required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Transform the request body to match the expected format
  req.body.submissionContent = {
    text: hasTextSubmission ? submissionText.trim() : '',
    files: files ? files.map(file => file.filename) : []
  };

  // Ensure studentName is properly set
  req.body.studentName = studentName.trim();

  next();
};

export const validateGrade = (req: Request, res: Response, next: NextFunction) => {
  const { grades } = req.body;

  const errors: string[] = [];

  if (!Array.isArray(grades) || grades.length === 0) {
    errors.push('Grades must be a non-empty array');
  } else {
    grades.forEach((gradeEntry, index) => {
      if (!gradeEntry.studentId || !Types.ObjectId.isValid(gradeEntry.studentId)) {
        errors.push(`Valid student ID is required for entry at index ${index}`);
      }
      if (typeof gradeEntry.grade !== 'number' || gradeEntry.grade < 0) {
        errors.push(`Grade must be a non-negative number for entry at index ${index}`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}; 