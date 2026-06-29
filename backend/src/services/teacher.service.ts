import UserRepository from '../repositories/user.repository.js';
import { TeacherDashboardDto } from '@shared/types';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { MeetService } from './meet.service.js';

export class TeacherService {
  static async getDashboard(passportId: number): Promise<TeacherDashboardDto> {
    const projects = await ProjectRepository.findAll({ passportId });
    const meets = await MeetRepository.findAll({ passportId });
    const users = await Promise.all(projects.map(project => UserRepository.findByProjectId(project.id)));
    const uniqueUsers = [...new Map(users.flat().map(item => [item.id, item])).values()];
    const bmeets = await MeetService.findAll({ passportId });

    return {
      projects: projects.length,
      meets: meets.length,
      students: uniqueUsers.length,
      debit: 35600,

      bmeets,
    };
  }
}
