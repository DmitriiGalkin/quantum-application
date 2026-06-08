import ProjectRepository from '../models/project.repository.js';
import MeetRepository from '../models/meet.repository.js';
import UserRepository from '../models/user.repository.js';
import PassportRepository from '../models/passport.repository.js';
import { IParams } from '@shared/types';

export class ProjectService {
  static async create(passport: any, data: any) {
    if (!passport) throw new Error('UNAUTHORIZED');

    return ProjectRepository.create({
      ...data,
      passportId: passport.id,
    });
  }

  static async update(id: number, data: any) {
    return ProjectRepository.update(id, data);
  }

  static async remove(passport: any, projectId: number) {
    const project = await ProjectRepository.findById(projectId);

    if (!project) throw new Error('NOT_FOUND');

    if (project.passportId !== passport.id) {
      throw new Error('FORBIDDEN');
    }

    const meets = await MeetRepository.findByProjectId(projectId);
    await Promise.all(meets.map(m => MeetRepository.delete(m.id)));

    await ProjectRepository.delete(projectId);
  }

  static async findAll(params: IParams) {
    const projects = await ProjectRepository.findAll(params);

    const [usersArr, meetsArr, passportsArr] = await Promise.all([
      Promise.all(projects.map(p => UserRepository.findByProjectId(p.id))),
      Promise.all(projects.map(p => MeetRepository.findRecommendationByProjectId(p.id))),
      Promise.all(projects.map(p => PassportRepository.findById(p.passportId as number))),
    ]);

    return projects.map((project, i) => ({
      ...project,
      users: usersArr[i],
      recommendMeet: meetsArr[i],
      passport: passportsArr[i],
    }));
  }

  static async findById(projectId: number) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) return null;

    const [passport, users, meets] = await Promise.all([
      PassportRepository.findById(project.passportId as number),
      UserRepository.findByProjectId(projectId),
      MeetRepository.findByProjectId(projectId),
    ]);

    const usersForMeets = await Promise.all(meets.map(m => UserRepository.findByMeetId(m.id)));

    return {
      ...project,
      passport,
      users,
      meets: meets.map((m, i) => ({
        ...m,
        users: usersForMeets[i],
      })),
    };
  }

  static async meta(id: number) {
    const project = await ProjectRepository.findById(id);
    if (!project) throw new Error('NOT_FOUND');

    return {
      title: `${project.title} | Quantum`,
      description: project.description,
      ogSiteName: 'Quantum | Проекты',
      ogType: 'article',
      ogTitle: project.title,
      ogDescription: project.description,
    };
  }
}
