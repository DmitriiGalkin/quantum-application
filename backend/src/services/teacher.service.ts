import UserRepository from '../repositories/user.repository.js';
import { TeacherDashboardDto, TeacherPublicDto } from '@shared/types';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { MeetService } from './meet.service.js';
import PassportRepository from '../repositories/passport.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import PlaceRepository from '../repositories/place.repository.js';

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

  static async findById(id: number): Promise<TeacherPublicDto | null> {
    const passport = await PassportRepository.findById(id);
    if (!passport) return null;

    const projects = await ProjectRepository.findAll({ passportId: id });
    const ideas = await IdeaRepository.findByTeacherId(id);

    const [usersArr, placeArr, meetsArr, ideaUsers] = await Promise.all([
      Promise.all(projects.map(p => UserRepository.findByProjectId(p.id))),
      Promise.all(projects.map(p => PlaceRepository.findById(p.placeId) as Promise<any>)),
      Promise.all(projects.map(p => MeetService.findAll({ projectId: p.id }))),
      Promise.all(ideas.map(i => UserRepository.findById(i.userId))),
    ]);

    const projectExtendeds = projects.map((project, i) => ({
      ...project,
      passport,
      place: placeArr[i],
      meets: meetsArr[i],
      users: usersArr[i],
    }));

    const ideaExtendeds = ideas.map((idea, i) => ({
      ...idea,
      user: ideaUsers[i] || null,
    }));

    return {
      passport,
      projects: projectExtendeds,
      ideas: ideaExtendeds,
    };
  }
}
