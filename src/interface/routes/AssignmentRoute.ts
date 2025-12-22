// src/routes/assignmentRoutes.ts
import { Router } from 'express';
import { AssignmentController, assignmentUpload, submissionUpload } from '../controllers/AssignmentController';
import { AssignmentUseCase } from '../../application/useCases/AssignmentUseCase';
import { AssignmentRepository } from '../../infrastructure/repositories/AssignmentRepository';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateAssignment, validateSubmission, validateGrade } from '../middleware/validation';
import { isValidObjectId } from 'mongoose';

const router = Router();

import { NotificationUseCase } from '../../application/useCases/NotificationUseCase';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { StudentRepository } from '../../infrastructure/repositories/studentRepository';

// Initialize dependencies
const assignmentRepository = new AssignmentRepository();
const notificationRepository = new NotificationRepository();
const studentRepository = new StudentRepository();

const notificationUseCase = new NotificationUseCase(notificationRepository);
const assignmentUseCase = new AssignmentUseCase(
  assignmentRepository, 
  notificationUseCase, 
  studentRepository
);
const assignmentController = new AssignmentController(assignmentUseCase);

// Middleware to validate ObjectId
const validateObjectId = (req: any, res: any, next: any) => {
    const id = req.params.id || req.params.departmentId || req.params.teacherId;
    if (id && !isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};

// Create assignment (Teachers and Admins only)
router.post(
    '/',
    authenticateToken,
    authorizeRoles(['teacher', 'admin']),
    assignmentUpload.array('attachments', 5), // Allow up to 5 files
    assignmentController.createAssignment.bind(assignmentController)
);

// Get all assignments (with filters) - All authenticated users
router.get(
    '/',
    authenticateToken,
    authorizeRoles(['student', 'teacher', 'admin']),
    assignmentController.getAssignments.bind(assignmentController)
);

// Get assignments by department ID - All authenticated users
router.get(
    '/department/:departmentId',
    authenticateToken,
    authorizeRoles(['student', 'teacher', 'admin']),
    validateObjectId,
    assignmentController.getAssignmentsByDepartment.bind(assignmentController)
);

// Get assignments by teacher ID - All authenticated users
router.get(
    '/teacher/:teacherId',
    authenticateToken,
    authorizeRoles(['student', 'teacher', 'admin']),
    validateObjectId,
    assignmentController.getAssignmentsByTeacher.bind(assignmentController)
);

// Get assignment by ID - All authenticated users
router.get(
    '/:id',
    authenticateToken,
    authorizeRoles(['student', 'teacher', 'admin']),
    validateObjectId,
    assignmentController.getAssignmentById.bind(assignmentController)
);

// Update assignment (Teachers and Admins only)
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles(['teacher', 'admin']),
    validateObjectId,
    validateAssignment,
    assignmentController.updateAssignment.bind(assignmentController)
);

// Delete assignment (Teachers and Admins only)
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles(['teacher', 'admin']),
    validateObjectId,
    assignmentController.deleteAssignment.bind(assignmentController)
);

// Submit assignment (Students only)
router.post(
    '/:id/submit',
    authenticateToken,
    authorizeRoles(['student']),
    validateObjectId,
    submissionUpload.array('files', 5), // Allow up to 5 files
    validateSubmission,
    assignmentController.submitAssignment.bind(assignmentController)
);

// Grade submission (Teachers and Admins only)
router.post(
    '/:id/grade',
    authenticateToken,
    authorizeRoles(['teacher', 'admin']),
    validateObjectId,
    validateGrade,
    assignmentController.gradeSubmission.bind(assignmentController)
);

// Get all submissions for an assignment (Teachers and Admins only)
router.get(
    '/:id/submissions',
    authenticateToken,
    authorizeRoles(['teacher', 'admin']),
    validateObjectId,
    assignmentController.getSubmissions.bind(assignmentController)
);

export default router;