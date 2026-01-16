import express from 'express';
import { ResourceController } from '../controllers/ResourceController';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import { ResourceRepository } from '../../infrastructure/repositories/ResourceRepository';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

import logger from '../../infrastructure/config/logger';

const router = express.Router();

const resourceRepository = new ResourceRepository(logger);
const resourceUseCase = new ResourceUseCase(resourceRepository, logger);
const resourceController = new ResourceController(resourceUseCase, logger);

router.post('/', authenticateToken, authorizeRoles(['Admin']), resourceController.createResource.bind(resourceController));
router.get('/', authenticateToken, resourceController.getAllResources.bind(resourceController));
router.get('/:id', authenticateToken, resourceController.getResourceById.bind(resourceController));
router.put('/:id', authenticateToken, authorizeRoles(['Admin']), resourceController.updateResource.bind(resourceController));
router.delete('/:id', authenticateToken, authorizeRoles(['Admin']), resourceController.deleteResource.bind(resourceController));

export default router;
