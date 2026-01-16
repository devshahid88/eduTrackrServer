import { Router, Request, Response } from "express";
import { AiController } from '../controllers/AiController';
import { AiUseCase } from '../../application/useCases/AiUseCase';
import { AiRepository } from '../../infrastructure/repositories/AiRepository';

import logger from '../../infrastructure/config/logger';

const router = Router();

const aiRepository = new AiRepository(logger);
const aiUseCase = new AiUseCase(aiRepository, logger);
const aiController = new AiController(aiUseCase, logger);

router.post('/student/chat', aiController.handleStudentChat.bind(aiController));

router.post('/teacher/chat', aiController.handleTeacherChat.bind(aiController));

export default router; 