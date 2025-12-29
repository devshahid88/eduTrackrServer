import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { connectDB } from './infrastructure/config/db';
import AuthRoutes from './interface/routes/AuthRoute';
import StudentRoutes from './interface/routes/StudentRoutes';
import AdminRoutes from './interface/routes/AdminRoutes';
import TeacherRoutes from './interface/routes/TeacherRoutes';
import DepartmentRoutes from './interface/routes/departmentRoutes';
import CourseRoutes from './interface/routes/courseRoutes';
import ResourceRoutes from './interface/routes/ResourceRoutes';
import AnnouncementRoutes from './interface/routes/AnnouncementRoutes';
import ScheduleRoutes from './interface/routes/ScheduleRoutes';
import AssignmentRoute from './interface/routes/AssignmentRoute';
import AiRoutes from './interface/routes/AiRoute';
import  createNotificationRoutes  from './interface/routes/NotificationRoutes';
import { createChatRoutes } from './interface/routes/ChatRoutes';
import { initializeSocket } from './infrastructure/config/socket';
import ConcernRoutes from './interface/routes/ConcernRoutes';
import { AnnouncementRepository } from './infrastructure/repositories/AnnouncementRepository';
import { NotificationRepository } from './infrastructure/repositories/NotificationRepository';
import { StudentRepository } from './infrastructure/repositories/studentRepository';
import { TeacherRepository } from './infrastructure/repositories/TeacherRepository';
import { NotificationUseCase } from './application/useCases/NotificationUseCase';
import { AnnouncementUseCase } from './application/useCases/AnnouncementUseCase';
import { AnnouncementController } from './interface/controllers/AnnouncementController';
import { AssignmentRepository } from './infrastructure/repositories/AssignmentRepository';
import { AssignmentUseCase } from './application/useCases/AssignmentUseCase';
import { AssignmentController } from './interface/controllers/AssignmentController';
import mongoose from 'mongoose';
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Initialize Socket.IO
initializeSocket(io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy 🚀' });
});

// Serve profile pictures
app.use('/uploads', express.static(path.join(process.cwd(), 'src/infrastructure/fileStorage/profilePic')));

// Routes
app.use('/auth', AuthRoutes);
app.use('/api/students', StudentRoutes);
app.use('/api/admins', AdminRoutes);
app.use('/api/teachers', TeacherRoutes);
app.use('/api/departments', DepartmentRoutes);
app.use('/api/courses', CourseRoutes);
app.use('/api/schedules', ScheduleRoutes);
app.use('/api/assignments', AssignmentRoute);
app.use('/api/messages', createChatRoutes(io));
app.use('/api/ai', AiRoutes);
app.use('/api/notifications', createNotificationRoutes);
app.use('/api/concerns', ConcernRoutes);
app.use('/api/resources', ResourceRoutes);
app.use('/api/announcements', AnnouncementRoutes);

const APP_ID = process.env.YOUR_AGORA_APP_ID;
const APP_CERTIFICATE =process.env.YOUR_AGORA_APP_CERTIFICATE;

app.post('/api/agora/token', (req, res) => {
  const { channelName, userId } = req.body;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      userId,
      role,
      privilegeExpiredTs
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});


// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  console.log(err.message)
  res.status(status).json({
    error: err.message || 'Something went wrong!',
    
    status,
  });
});


// Initialize Repositories
const announcementRepository = new AnnouncementRepository();
const notificationRepository = new NotificationRepository();
const studentRepository = new StudentRepository();
const teacherRepository = new TeacherRepository();
const assignmentRepository = new AssignmentRepository(); // Added

// Initialize UseCases
const notificationUseCase = new NotificationUseCase(notificationRepository);
const announcementUseCase = new AnnouncementUseCase(
  announcementRepository, 
  notificationUseCase, 
  studentRepository, 
  teacherRepository
);
const announcementController = new AnnouncementController(announcementUseCase);
const assignmentUseCase = new AssignmentUseCase(
  assignmentRepository,
  notificationUseCase,
  studentRepository
);
const assignmentController = new AssignmentController(assignmentUseCase);

const PORT = process.env.PORT || 3003;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});