import { Router, Request, Response } from "express";
import { AiController } from '../controllers/AiController';
import { AiUseCase } from '../../application/useCases/AiUseCase';
import { AiRepository } from '../../infrastructure/repositories/AiRepository';

const router = Router();

const aiRepository = new AiRepository();
const aiUseCase = new AiUseCase(aiRepository);
const aiController = new AiController(aiUseCase);

router.post('/student/chat', aiController.handleStudentChat.bind(aiController));

router.post('/teacher/chat', aiController.handleTeacherChat.bind(aiController));

export default router; 