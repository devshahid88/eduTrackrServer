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
import ScheduleRoutes from './interface/routes/ScheduleRoutes';
import AssignmentRoute from './interface/routes/AssignmentRoute';
import AiRoutes from './interface/routes/AiRoute';
import  createNotificationRoutes  from './interface/routes/NotificationRoutes';
import { createChatRoutes } from './interface/routes/ChatRoutes';
import { initializeSocket } from './infrastructure/config/socket';
import ConcernRoutes from './interface/routes/ConcernRoutes';
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


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});