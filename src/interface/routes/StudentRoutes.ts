// src/routes/studentRoutes.ts
import { Router, Request, Response } from "express";
import { StudentController } from "../controllers/StudentController";
import { StudentUseCase } from "../../application/useCases/studentUseCase";
import { StudentRepository } from "../../infrastructure/repositories/studentRepository";
import { upload } from "../middleware/multer";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { validateUser, validateUserUpdate, validateProfileImage } from "../middleware/validation";
import { isValidObjectId } from "mongoose";

const router = Router();

const studentRepository = new StudentRepository();
const studentUseCase = new StudentUseCase(studentRepository);
const studentController = new StudentController(studentUseCase);

// Student creation - Only admins can create students
router.post('/create', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  upload.single('profileImage'), 
  validateUser, 
  studentController.createStudentWithImage.bind(studentController)
);

// Profile image update - Students can update their own, admins can update any
router.put('/:id/profile-image', 
  authenticateToken, 
  authorizeRoles(['student', 'admin']), 
  upload.single('profileImage'), 
  studentController.updateProfileImage.bind(studentController)
);

// Get student by ID - Students can view their own, teachers and admins can view any
router.get('/:id', 
  authenticateToken, 
  authorizeRoles(['student', 'teacher', 'admin']), 
  studentController.getStudentById.bind(studentController)
);

// Update student - Students can update their own, admins can update any
router.put('/:id', 
  authenticateToken, 
  authorizeRoles(['student', 'admin']), 
  validateUserUpdate, 
  studentController.updateStudent.bind(studentController)
);

// Delete student - Only admins can delete students
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  studentController.deleteStudent.bind(studentController)
);

// Get all students - Teachers and admins can view all students
router.get('/', 
  authenticateToken, 
  authorizeRoles(['teacher', 'admin']), 
  studentController.getAllStudents.bind(studentController)
);

export default router;