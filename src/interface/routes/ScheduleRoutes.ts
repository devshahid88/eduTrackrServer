// src/routes/scheduleRoutes.ts
import { Router, Request, Response } from "express";
import { ScheduleController } from "../controllers/ScheduleController";
import { ScheduleUseCase } from "../../application/useCases/ScheduleUseCase";
import { ScheduleRepository } from "../../infrastructure/repositories/ScheduleRepository";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { isValidObjectId } from "mongoose";

const router = Router();

// Create instances
const scheduleRepository = new ScheduleRepository();
const scheduleUseCase = new ScheduleUseCase(scheduleRepository);
const scheduleController = new ScheduleController(scheduleUseCase);

// Middleware to validate ObjectId
const validateObjectId = (req: any, res: any, next: any) => {
    const id = req.params.id || req.params.departmentId || req.params.teacherId;
    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }
    next();
};

// Create schedule - Only admins can create schedules
router.post('/create', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    scheduleController.createSchedule.bind(scheduleController)
);

// Get all schedules - All authenticated users can view schedules
router.get('/', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    scheduleController.getAllSchedules.bind(scheduleController)
);

// Get schedules by department - All authenticated users can view schedules by department
router.get('/department/:departmentId', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateObjectId, 
    scheduleController.getSchedulesByDepartment.bind(scheduleController)
);

// Get schedules by teacher - All authenticated users can view schedules by teacher
router.get('/teacher/:teacherId', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateObjectId, 
    scheduleController.getSchedulesByTeacher.bind(scheduleController)
);

// Get schedule by ID - All authenticated users can view schedule details
router.get('/:id', 
    authenticateToken, 
    authorizeRoles(['student', 'teacher', 'admin']), 
    validateObjectId, 
    scheduleController.findScheduleById.bind(scheduleController)
);

// Update schedule - Only admins can update schedules
router.put('/:id', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    validateObjectId, 
    scheduleController.updateSchedule.bind(scheduleController)
);

// Delete schedule - Only admins can delete schedules
router.delete('/:id', 
    authenticateToken, 
    authorizeRoles(['admin']), 
    validateObjectId, 
    scheduleController.deleteSchedule.bind(scheduleController)
);

// Start live class - Only teachers and admins can start live classes
router.post('/:id/start', 
    authenticateToken, 
    authorizeRoles(['teacher', 'admin']), 
    validateObjectId, 
    scheduleController.startLiveClass.bind(scheduleController)
);

export default router;