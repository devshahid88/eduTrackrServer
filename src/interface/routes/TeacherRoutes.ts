
// src/routes/teacherRoutes.ts
import { Router, Request, Response } from "express";
import { TeacherController } from "../controllers/TeacherController";
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";
import { TeacherRepository } from "../../infrastructure/repositories/TeacherRepository";
import { validateUser, validateUserUpdate, validateProfileImage } from "../middleware/validation";
import { upload } from "../middleware/multer";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

const teacherRepository = new TeacherRepository();
const teacherUseCase = new TeacherUseCase(teacherRepository);
const teacherController = new TeacherController(teacherUseCase);

// Teacher creation - Only admins can create teachers
router.post('/create', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  upload.single('profileImage'), 
  validateUser, 
  teacherController.createTeacherWithImage.bind(teacherController)
);

// Profile image update - Teachers can update their own, admins can update any
router.put('/:id/profile-image', 
  authenticateToken, 
  authorizeRoles(['teacher', 'admin']), 
  upload.single('profileImage'), 
  teacherController.updateProfileImage.bind(teacherController)
);

// Get all teachers - All authenticated users can view teachers
router.get('/', 
  authenticateToken, 
  authorizeRoles(['student', 'teacher', 'admin']), 
  teacherController.getAllTeachers.bind(teacherController)
);

// Get teacher by ID - All authenticated users can view teacher details
router.get('/:id', 
  authenticateToken, 
  authorizeRoles(['student', 'teacher', 'admin']), 
  teacherController.findTeacherById.bind(teacherController)
);

// Update teacher - Teachers can update their own, admins can update any
router.put('/:id', 
  authenticateToken, 
  authorizeRoles(['teacher', 'admin']), 
  teacherController.updateTeacher.bind(teacherController)
);

// Delete teacher - Only admins can delete teachers
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  teacherController.deleteTeacher.bind(teacherController)
);

export default router;