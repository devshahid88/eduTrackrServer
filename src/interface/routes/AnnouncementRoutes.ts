import express from 'express';
import { AnnouncementController } from '../controllers/AnnouncementController';
import { AnnouncementUseCase } from '../../application/useCases/AnnouncementUseCase';
import { AnnouncementRepository } from '../../infrastructure/repositories/AnnouncementRepository';

import { authenticateToken, authorizeRoles } from '../middleware/auth';

import { NotificationUseCase } from '../../application/useCases/NotificationUseCase';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { StudentRepository } from '../../infrastructure/repositories/studentRepository';
import { TeacherRepository } from '../../infrastructure/repositories/TeacherRepository';

import logger from '../../infrastructure/config/logger';

const router = express.Router();

const announcementRepository = new AnnouncementRepository(logger);
const notificationRepository = new NotificationRepository(logger);
const studentRepository = new StudentRepository(logger);
const teacherRepository = new TeacherRepository(logger);

const notificationUseCase = new NotificationUseCase(notificationRepository, logger);
const announcementUseCase = new AnnouncementUseCase(
  announcementRepository,
  notificationUseCase,
  studentRepository,
  teacherRepository,
  logger
);
const announcementController = new AnnouncementController(announcementUseCase, logger);

router.post('/', authenticateToken, authorizeRoles(['Admin']), announcementController.createAnnouncement.bind(announcementController));
router.get('/', authenticateToken, announcementController.getAllAnnouncements.bind(announcementController));
router.get('/:id', authenticateToken, announcementController.getAnnouncementById.bind(announcementController));
router.put('/:id', authenticateToken, authorizeRoles(['Admin']), announcementController.updateAnnouncement.bind(announcementController));
router.delete('/:id', authenticateToken, authorizeRoles(['Admin']), announcementController.deleteAnnouncement.bind(announcementController));

export default router;
