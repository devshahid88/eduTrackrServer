// src/routes/departmentRoutes.ts
import { Router } from "express";
import { DepartmentController } from "../controllers/DepartmentController";
import { DepartmentUseCase } from "../../application/useCases/DepartmentUseCase";
import { DepartmentRepository } from "../../infrastructure/repositories/DepartmentRepository";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { isValidObjectId } from "mongoose";

const router = Router();

const departmentRepository = new DepartmentRepository();
const departmentUseCase = new DepartmentUseCase(departmentRepository);
const departmentController = new DepartmentController(departmentUseCase);

// Middleware to validate ObjectId
const validateObjectId = (req: any, res: any, next: any) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid department ID format"
        });
    }
    next();
};

// Create department - Only admins can create departments
router.post('/create', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    departmentController.createDepartment.bind(departmentController)
);

// Get department by ID - All authenticated users can view department details
router.get('/:id', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateObjectId, 
    departmentController.getDepartmentById.bind(departmentController)
);

// Update department - Only admins can update departments
router.put('/:id', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    validateObjectId, 
    departmentController.updateDepartment.bind(departmentController)
);

// Delete department - Only admins can delete departments
router.delete('/:id', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    validateObjectId, 
    departmentController.deleteDepartment.bind(departmentController)
);

// Get all departments - All authenticated users can view all departments
router.get('/', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    departmentController.getAllDepartments.bind(departmentController)
);

export default router;