import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import { Passport } from '../entities/passport.js';
import { FindAllProjectInput } from '../entities/project.js';
import PlaceRepository from '../repositories/place.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import { Idea } from '../entities/idea.js';
import { FeedService } from './feed.service.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import { ProjectUser } from '../entities/project-user.js';
import { Place } from '../entities/place.js';
import { CreateProject, type ProjectFullDto } from '@shared/types';
import PaymentRepository from '../repositories/payment.repository.js';
import { MeetService } from './meet.service.js';
import { Viewer } from '../router.js';

export class ProjectService {
  static async create(passport: Passport, data: CreateProject) {
    if (!passport) throw new Error('UNAUTHORIZED');

    return ProjectRepository.create({
      ...data,
      passportId: passport.id,
    });
  }

  static async update(projectId: number, data: CreateProject) {
    if (!projectId) throw new Error('нет идентификатора проекта');

    return ProjectRepository.update(projectId, data);
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

  static async findAll(params: FindAllProjectInput): Promise<ProjectFullDto[]> {
    const projects = await ProjectRepository.findAll(params);

    const [ideas, usersArr, passportsArr, placeArr, meetsArr] = await Promise.all([
      Promise.all(projects.map(p => (p.ideaId ? (IdeaRepository.findById(p.ideaId) as Promise<Idea>) : null))),
      Promise.all(projects.map(p => UserRepository.findByProjectId(p.id))),
      Promise.all(projects.map(p => PassportRepository.findById(p.passportId) as Promise<Passport>)),
      Promise.all(projects.map(p => PlaceRepository.findById(p.placeId) as Promise<Place>)),
      Promise.all(projects.map(p => MeetService.findAll({ projectId: p.id }))),
    ]);

    return projects.map((project, i) => ({
      ...project,
      idea: ideas[i],
      users: usersArr[i],
      passport: passportsArr[i],
      place: placeArr[i],
      meets: meetsArr[i],
    }));
  }

  static async findById(projectId: number, viewer?: Viewer): Promise<ProjectFullDto> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error('NOT_FOUND');

    const [passport, users, meets, place, idea, joins] = await Promise.all([
      PassportRepository.findById(project.passportId as number) as Promise<Passport>,
      UserRepository.findByProjectId(projectId),
      MeetRepository.findByProjectId(projectId, viewer?.role === 'teacher'),
      PlaceRepository.findById(project.placeId) as Promise<Place>,
      project.ideaId ? (IdeaRepository.findById(project.ideaId) as Promise<Idea>) : null,
      ProjectUserRepository.findByProjectId(project.id) as Promise<ProjectUser[]>,
    ]);

    const placesForMeets = await Promise.all(meets.map(m => PlaceRepository.findById(m.id) as Promise<Place>));
    const usersForMeets = await Promise.all(meets.map(m => UserRepository.findByMeetId(m.id)));
    const passportsForMeets = await Promise.all(meets.map(m => PassportRepository.findById(m.passportId) as Promise<Passport>));

    const meetIds = meets.map(m => m.id);

    console.log(viewer, 'viewer');
    const paymentIds = viewer?.userId && meetIds.length ? await PaymentRepository.findPaidMeetIdsByUser(viewer.userId, meetIds) : [];
    console.log(paymentIds, 'paymentIds');

    const meetExtendeds = meets.map((m, i) => ({
      ...m,
      projectTitle: project.title,
      place: placesForMeets[i],
      users: usersForMeets[i],
      isPaid: paymentIds.includes(m.id),
      passport: passportsForMeets[i],
      capacity: users.length,
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
