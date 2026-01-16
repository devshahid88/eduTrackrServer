// src/routes/adminRoutes.ts
import { Router, Request, Response } from "express";
import { AdminController } from "../controllers/AdminController";
import { AdminUseCase } from "../../application/useCases/AdminUseCase";
import { AdminRepository } from "../../infrastructure/repositories/AdminRepository";
import { TeacherRepository } from "../../infrastructure/repositories/TeacherRepository";
import { StudentRepository } from "../../infrastructure/repositories/studentRepository";
import { EmailService } from "../../infrastructure/services/EmailService";
import { upload } from "../middleware/multer";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

import { validateUser, validateUserUpdate, validateProfileImage } from "../middleware/validation";

import logger from "../../infrastructure/config/logger";

const router = Router();

// Initialize repositories and use cases
const adminRepository = new AdminRepository(logger);
const teacherRepository = new TeacherRepository(logger);
const studentRepository = new StudentRepository(logger);
const emailService = new EmailService();
const adminUseCase = new AdminUseCase(adminRepository, emailService, teacherRepository, studentRepository, logger);
const adminController = new AdminController(adminUseCase, logger);

// Admin routes - Only admins can manage other admins
router.post("/create", 
  authenticateToken, 
  authorizeRoles(['admin']), 
  upload.single("profileImage"), 
  validateUser,
  adminController.createAdminWithImage.bind(adminController)
);

router.get("/", 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminController.getAllAdmins.bind(adminController)
);

router.get("/search", 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminController.searchUsers.bind(adminController)
);

router.get("/:id", 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminController.findAdminById.bind(adminController)
);

router.put("/:id", 
  authenticateToken, 
  authorizeRoles(['admin']), 
  upload.single("profileImage"), 
  adminController.updateAdmin.bind(adminController)
);

router.put("/:id/profile-image", 
  authenticateToken, 
  authorizeRoles(['admin']), 
  upload.single("profileImage"), 
  adminController.updateAdminProfileImage.bind(adminController)
);

router.delete("/:id", 
  authenticateToken, 
  authorizeRoles(['admin']), 
  adminController.deleteAdmin.bind(adminController)
);

export default router;