// src/routes/concernRoutes.ts (Updated for consistency)
import { Router } from 'express';
import { ConcernController } from '../controllers/ConcernController';
import { ConcernUseCase } from '../../application/useCases/ConcernUseCase';
import { ConcernRepository } from '../../infrastructure/repositories/ConcernRepository';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

const concernRepository = new ConcernRepository();
const concernUseCase = new ConcernUseCase(concernRepository);
const concernController = new ConcernController(concernUseCase);

// Raise concern - Students, teachers, and admins can raise concerns
router.post('/', 
  authenticateToken, 
  authorizeRoles(['student', 'teacher', 'admin']), 
  concernController.raiseConcern.bind(concernController)
);

// Get my concerns - Students and teachers can view their own concerns
router.get('/my', 
  authenticateToken, 
  authorizeRoles(['student', 'teacher']), 
  concernController.getMyConcerns.bind(concernController)
);

// Get all concerns - Only admins can view all concerns
router.get('/', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  concernController.getAllConcerns.bind(concernController)
);

// Update concern status - Only admins can update concern status
router.patch('/:id', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  concernController.updateConcernStatus.bind(concernController)
);

// Update concern - Only admins can update concerns
router.put('/:id', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  concernController.updateConcern.bind(concernController)
);

// Delete concern - Only admins can delete concerns
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles(['admin']), 
  concernController.deleteConcern.bind(concernController)
);

// Get concerns by user ID - All authenticated users can view concerns by user ID
router.get('/user/:userId', 
  authenticateToken, 
  authorizeRoles(['student', 'teacher', 'admin']), 
  concernController.getConcernsByUserId.bind(concernController)
);

export default router;