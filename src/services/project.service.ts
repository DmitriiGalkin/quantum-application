import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import type { Passport, GetProjectsQuery, ProjectUser, Place, CreateProject, ProjectDto } from 'entities';
import PlaceRepository from '../repositories/place.repository.js';
import { FeedService } from './feed.service.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import PaymentRepository from '../repositories/payment.repository.js';
import { MeetService } from './meet.service.js';
import type { Viewer } from '../router.js';
import { IdeaService } from './idea.service.js';
import { ParticipantsService } from './participants.service.js';
import { HttpError } from '../utils/http-error.js';
import { db } from '../utils/dbNext.js';
import { requireId } from '../utils/validation.js';

export class ProjectService {
  static async create(passport: Passport, data: CreateProject) {
    if (!passport) throw new HttpError('UNAUTHORIZED', 401);
    const placeId = requireId(data.placeId, 'центра');
    if (!await PlaceRepository.findById(placeId)) throw new HttpError('Центр не найден', 404);

    return ProjectRepository.create({
      ...data,
      passportId: passport.id,
    });
  }

  static async update(projectId: number, data: CreateProject, passportId: number) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new HttpError('Проект не найден', 404);
    if (project.passportId !== passportId) throw new HttpError('Нет доступа к проекту', 403);
    return ProjectRepository.update(projectId, {
      title: data.title, description: data.description, image: data.image,
      placeId: data.placeId, ideaId: data.ideaId,
    });
  }

  static async remove(projectId: number, passport: Passport) {
    const project = await ProjectRepository.findById(projectId);

    if (!project) throw new HttpError('NOT_FOUND', 404);

    if (project.passportId !== passport.id) {
      throw new HttpError('FORBIDDEN', 403);
    }

    await db.transaction(async conn => {
      await MeetRepository.deleteByProjectId(projectId, conn);
      await ProjectRepository.delete(projectId, conn);
    });
  }

  static async findAll(params: GetProjectsQuery): Promise<ProjectDto[]> {
    const projects = await ProjectRepository.findAll(params);
    const [ideas, users, passports, places, meetRows] = await Promise.all([
      IdeaService.findByIds(projects.flatMap(project => project.ideaId ? [project.ideaId] : [])),
      ParticipantsService.forProjects(projects.map(project => project.id)),
      PassportRepository.findByIds(projects.map(project => project.passportId)),
      PlaceRepository.findByIds(projects.map(project => project.placeId)),
      MeetRepository.findByProjectIds(projects.map(project => project.id), true),
    ]);
    const meets = await MeetService.hydrateAll(meetRows);
    const ideaById = new Map(ideas.map(idea => [idea.id, idea]));
    const passportById = new Map(passports.map(passport => [passport.id, passport]));
    const placeById = new Map(places.map(place => [place.id, place]));
    const meetsByProject = new Map<number, typeof meets>();
    for (const meet of meets) {
      const group = meetsByProject.get(meet.projectId) ?? [];
      group.push(meet);
      meetsByProject.set(meet.projectId, group);
    }
    return projects.map(project => {
      const passport = passportById.get(project.passportId);
      const place = placeById.get(project.placeId);
      if (!passport || !place) throw new HttpError('Не найдены связанные данные проекта', 500);
      return {
        id: project.id, title: project.title, description: project.description, image: project.image,
        idea: project.ideaId ? ideaById.get(project.ideaId) ?? null : null,
        users: users.get(project.id) ?? [], passport, place, meets: meetsByProject.get(project.id) ?? [],
      };
    });
  }

  static async findById(projectId: number, viewer?: Viewer): Promise<ProjectDto> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new HttpError('NOT_FOUND', 404);

    const [passport, users, meets, place, idea, joins] = await Promise.all([
      PassportRepository.findById(project.passportId as number) as Promise<Passport>,
      UserRepository.findByProjectId(projectId),
      MeetRepository.findByProjectId(projectId, viewer?.role === 'teacher'),
      PlaceRepository.findById(project.placeId) as Promise<Place>,
      project.ideaId ? IdeaService.findById(project.ideaId) : null,
      ProjectUserRepository.findByProjectId(project.id) as Promise<ProjectUser[]>,
    ]);

    const meetIds = meets.map(meet => meet.id);
    const paidMeetIds = new Set(viewer?.userId && meetIds.length ? await PaymentRepository.findPaidMeetIdsByUser(viewer.userId, meetIds) : []);
    const meetExtendeds = (await MeetService.hydrateAll(meets)).map(meet => ({
      ...meet, projectTitle: project.title, isPaid: paidMeetIds.has(meet.id),
    }));
    const userById = new Map(users.map(user => [user.id, user]));

    const feeds = FeedService.merge({
      meets: meetExtendeds,
      comments: [],
      joins: joins.flatMap(join => {
        const user = userById.get(join.userId);
        return user ? [{ ...join, user }] : [];
      }),
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
    if (!project) throw new HttpError('NOT_FOUND', 404);

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
