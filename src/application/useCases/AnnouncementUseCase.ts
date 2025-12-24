import mongoose from 'mongoose';
import { IAnnouncementRepository } from '../../domain/repositories/IAnnouncementRepository';
import { IAnnouncement } from '../../infrastructure/models/AnnouncementModel';
import { NotificationUseCase } from './NotificationUseCase';
import { IStudentRepository } from '../../application/Interfaces/IStudent';
import { ITeacherRepository } from '../../application/Interfaces/ITeacher';

export class AnnouncementUseCase {
  constructor(
    private announcementRepository: IAnnouncementRepository,
    private notificationUseCase: NotificationUseCase,
    private studentRepository: IStudentRepository,
    private teacherRepository: ITeacherRepository
  ) {}

  async createAnnouncement(announcement: Partial<IAnnouncement>): Promise<IAnnouncement> {
    const newAnnouncement = await this.announcementRepository.create(announcement);

    // Fan-out notifications
    if (announcement.targetRoles) {
      const targetUsers: { id: string; model: 'Teacher' | 'Student' }[] = [];

      if (announcement.targetRoles.includes('Student')) {
        const students = await this.studentRepository.getAllStudents();
        students.forEach(student => {
          if (student._id) targetUsers.push({ id: student._id.toString(), model: 'Student' });
        });
      }

      if (announcement.targetRoles.includes('Teacher')) {
        const teachers = await this.teacherRepository.getAllTeachers();
        teachers.forEach(teacher => {
           if (teacher.id) targetUsers.push({ id: teacher.id, model: 'Teacher' });
        });
      }

      // Create notifications for each user
      for (const user of targetUsers) {
        await this.notificationUseCase.createNotification({
          userId: new mongoose.Types.ObjectId(user.id),
          userModel: user.model,
          type: 'system', // or 'announcement' if enum allows, currently 'system' fits best or we update enum
          title: 'New Announcement: ' + announcement.title,
          message: announcement.message,
          read: false,
          sender: 'Admin',
          senderModel: 'Teacher', // Admin doesn't have a model, masking as Teacher or we update enum. Let's use Teacher for now or 'system' logic
          role: user.model // Receiver role
        });
      }
    }

    return newAnnouncement;
  }

  async getAllAnnouncements(): Promise<IAnnouncement[]> {
    return await this.announcementRepository.findAll();
  }

  async getAnnouncementById(id: string): Promise<IAnnouncement | null> {
    return await this.announcementRepository.findById(id);
  }

  async updateAnnouncement(id: string, announcement: Partial<IAnnouncement>): Promise<IAnnouncement | null> {
    return await this.announcementRepository.update(id, announcement);
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return await this.announcementRepository.delete(id);
  }

  async getAnnouncementsByRole(role: string): Promise<IAnnouncement[]> {
      return await this.announcementRepository.findByTargetRole(role);
  }
}
