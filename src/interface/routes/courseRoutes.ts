// src/routes/courseRoutes.ts
import { Router } from "express";
import { CourseController } from "../controllers/CourseController";
import { CourseUseCase } from "../../application/useCases/CourseUseCase";
import { CourseRepository } from "../../infrastructure/repositories/CourseRepository";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { isValidObjectId } from "mongoose";

const router = Router();

const courseRepository = new CourseRepository();
const courseUseCase = new CourseUseCase(courseRepository);
const courseController = new CourseController(courseUseCase);

const validateObjectId = (req: any, res: any, next: any) => {
    const id = req.params.id || req.params.departmentId;
    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};

// Create course - Only admins can create courses
router.post('/create', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    courseController.createCourse.bind(courseController)
);

// Get course by ID - All authenticated users can view course details
router.get('/:id', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateObjectId, 
    courseController.getCourseById.bind(courseController)
);

// Get courses by department - All authenticated users can view courses by department
router.get('/department/:departmentId', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateObjectId, 
    courseController.getCoursesByDepartment.bind(courseController)
);

// Update course - Only admins can update courses
router.put('/:id', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    validateObjectId, 
    courseController.updateCourse.bind(courseController)
);

// Delete course - Only admins can delete courses
router.delete('/:id', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    validateObjectId, 
    courseController.deleteCourse.bind(courseController)
);

// Get all courses - All authenticated users can view all courses
router.get('/', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    courseController.getAllCourses.bind(courseController)
);

export default router;