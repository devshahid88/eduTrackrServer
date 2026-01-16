import { IAnnouncementRepository } from '../Interfaces/IAnnouncementRepository';
import { Announcement } from '../../domain/entities/Announcement';
import { NotificationUseCase } from './NotificationUseCase';
import { IStudentRepository } from '../../application/Interfaces/IStudent';
import { ITeacherRepository } from '../../application/Interfaces/ITeacher';

import { ILogger } from '../Interfaces/ILogger';

export class AnnouncementUseCase {
  constructor(
    private announcementRepository: IAnnouncementRepository,
    private notificationUseCase: NotificationUseCase,
    private studentRepository: IStudentRepository,
    private teacherRepository: ITeacherRepository,
    private logger: ILogger
  ) {}

  async createAnnouncement(announcementData: Partial<Announcement>): Promise<Announcement> {
    const announcement = Announcement.create(announcementData);
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
          userId: user.id,
          userModel: user.model,
          type: 'system', // or 'announcement'
          title: 'New Announcement: ' + announcement.title,
          message: announcement.message,
          read: false,
          sender: 'Admin',
          senderModel: 'Admin',
          role: user.model as any
        });
      }
    }

    return newAnnouncement;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await this.announcementRepository.findAll();
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    return await this.announcementRepository.findById(id);
  }

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement | null> {
    return await this.announcementRepository.update(id, announcement);
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return await this.announcementRepository.delete(id);
  }

  async getAnnouncementsByRole(role: string): Promise<Announcement[]> {
      return await this.announcementRepository.findByTargetRole(role);
  }
}
