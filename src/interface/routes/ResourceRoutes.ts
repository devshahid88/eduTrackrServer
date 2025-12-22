import express from 'express';
import { ResourceController } from '../controllers/ResourceController';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import { ResourceRepository } from '../../infrastructure/repositories/ResourceRepository';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

const resourceRepository = new ResourceRepository();
const resourceUseCase = new ResourceUseCase(resourceRepository);
const resourceController = new ResourceController(resourceUseCase);

router.post('/', authenticateToken, authorizeRoles(['Admin']), resourceController.createResource.bind(resourceController));
router.get('/', authenticateToken, resourceController.getAllResources.bind(resourceController));
router.get('/:id', authenticateToken, resourceController.getResourceById.bind(resourceController));
router.put('/:id', authenticateToken, authorizeRoles(['Admin']), resourceController.updateResource.bind(resourceController));
router.delete('/:id', authenticateToken, authorizeRoles(['Admin']), resourceController.deleteResource.bind(resourceController));

export default router;
