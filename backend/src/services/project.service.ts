import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import { Passport } from '../entities/passport.js';
import { FindAllProjectInput, ProjectFullEntity } from '../entities/project.js';
import PlaceRepository from '../repositories/place.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import { Idea } from '../entities/idea.js';
import { FeedService } from './feed.service.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import { ProjectUser } from '../entities/project-user.js';
import { Place } from '../entities/place.js';

export class ProjectService {
  static async create(passport: any, data: any) {
    if (!passport) throw new Error('UNAUTHORIZED');

    return ProjectRepository.create({
      ...data,
      passportId: passport.id,
    });
  }

  static async remove(projectId: number, passport: Passport) {
    const project = await ProjectRepository.findById(projectId);

    if (!project) throw new Error('NOT_FOUND');

    if (project.passportId !== passport.id) {
      throw new Error('FORBIDDEN');
    }

    const meets = await MeetRepository.findByProjectId(projectId);
    await Promise.all(meets.map(m => MeetRepository.delete(m.id)));

    await ProjectRepository.delete(projectId);
  }

  static async findAll(params: FindAllProjectInput): Promise<ProjectFullEntity[]> {
    const projects = await ProjectRepository.findAll(params);

    const [ideas, usersArr, meetsArr, passportsArr, placeArr, meetArr] = await Promise.all([
      Promise.all(projects.map(p => IdeaRepository.findById(p.ideaId) as Promise<Idea>)),
      Promise.all(projects.map(p => UserRepository.findByProjectId(p.id))),
      Promise.all(projects.map(p => MeetRepository.findRecommendationByProjectId(p.id))),
      Promise.all(projects.map(p => PassportRepository.findById(p.passportId) as Promise<Passport>)),
      Promise.all(projects.map(p => PlaceRepository.findById(p.placeId) as Promise<Place>)),
      Promise.all(projects.map(p => MeetRepository.findByProjectId(p.id))),
    ]);
    const userMeetArr = await Promise.all(meetArr.map(meets => Promise.all(meets.map(meet => UserRepository.findByMeetId(meet.id)))));
    return projects.map((project, i) => ({
      ...project,
      idea: ideas[i],
      users: usersArr[i],
      recommendMeet: meetsArr[i],
      passport: passportsArr[i],
      place: placeArr[i],
      meets: meetArr[i].map((f, j) => ({
        ...f,
        project,
        users: userMeetArr[i][j],
      })),
    }));
  }

  static async findById(projectId: number): Promise<ProjectFullEntity> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error('NOT_FOUND');

    const [passport, users, meets, place, idea, joins] = await Promise.all([
      PassportRepository.findById(project.passportId as number) as Promise<Passport>,
      UserRepository.findByProjectId(projectId),
      MeetRepository.findByProjectId(projectId),
      PlaceRepository.findById(project.placeId) as Promise<Place>,
      IdeaRepository.findById(project.ideaId) as Promise<Idea>,
      ProjectUserRepository.findByProjectId(project.id) as Promise<ProjectUser[]>,
    ]);

    const usersForMeets = await Promise.all(meets.map(m => UserRepository.findByMeetId(m.id)));

    const meetExtendeds = meets.map((m, i) => ({
      ...m,
      project,
      users: usersForMeets[i],
    }));

    const feeds = FeedService.merge({
      meets: meetExtendeds,
      comments: [],
      joins: joins.map((u, i) => ({
        ...u,
        user: users[i],
      })),
    });

    return {
      ...project,
      passport,
      users,
      meets: meetExtendeds,
      place,
      idea,
      feeds,
    };
  }

  static async meta(id: number) {
    const project = await ProjectRepository.findById(id);
    if (!project) throw new Error('NOT_FOUND');

    return {
      title: `Quantum`,
      description: `Quantum`,
      ogSiteName: 'Quantum | Проекты',
      ogType: 'article',
      ogTitle: `Quantum`,
      ogDescription: `Quantum`,
    };
  }
}
