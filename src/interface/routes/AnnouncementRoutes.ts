import express from 'express';
import { AnnouncementController } from '../controllers/AnnouncementController';
import { AnnouncementUseCase } from '../../application/useCases/AnnouncementUseCase';
import { AnnouncementRepository } from '../../infrastructure/repositories/AnnouncementRepository';

import { authenticateToken, authorizeRoles } from '../middleware/auth';

import { NotificationUseCase } from '../../application/useCases/NotificationUseCase';
import { NotificationRepository } from '../../infrastructure/repositories/NotificationRepository';
import { StudentRepository } from '../../infrastructure/repositories/studentRepository';
import { TeacherRepository } from '../../infrastructure/repositories/TeacherRepository';

const router = express.Router();

const announcementRepository = new AnnouncementRepository();
const notificationRepository = new NotificationRepository();
const studentRepository = new StudentRepository();
const teacherRepository = new TeacherRepository();

const notificationUseCase = new NotificationUseCase(notificationRepository);
const announcementUseCase = new AnnouncementUseCase(
  announcementRepository,
  notificationUseCase,
  studentRepository,
  teacherRepository
);
const announcementController = new AnnouncementController(announcementUseCase);

router.post('/', authenticateToken, authorizeRoles(['Admin']), announcementController.createAnnouncement.bind(announcementController));
router.get('/', authenticateToken, announcementController.getAllAnnouncements.bind(announcementController));
router.get('/:id', authenticateToken, announcementController.getAnnouncementById.bind(announcementController));
router.put('/:id', authenticateToken, authorizeRoles(['Admin']), announcementController.updateAnnouncement.bind(announcementController));
router.delete('/:id', authenticateToken, authorizeRoles(['Admin']), announcementController.deleteAnnouncement.bind(announcementController));

export default router;
