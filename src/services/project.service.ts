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
import PlaceLocationRepository from '../repositories/place-location.repository.js';
import { selectShowcaseProjects } from './project-showcase.js';
import { validateProjectSchedule } from './project-weekly-schedule.js';

export class ProjectService {
  private static async validateLocation(placeId: number, value: unknown): Promise<number | null> {
    if (value == null) return null;
    const id = requireId(value, 'зала');
    const [location] = await PlaceLocationRepository.findByIds([id]);
    if (!location || location.deletedAt || location.placeId !== placeId) {
      throw new HttpError('Зал не найден в выбранном центре', 400);
    }
    return id;
  }

  static async create(passport: Passport, data: CreateProject) {
    if (!passport) throw new HttpError('UNAUTHORIZED', 401);
    const placeId = requireId(data.placeId, 'центра');
    if (!await PlaceRepository.findById(placeId)) throw new HttpError('Центр не найден', 404);
    const locationId = await this.validateLocation(placeId, data.locationId);
    const kind = data.kind ?? 'project';
    if (kind !== 'project' && kind !== 'regular') throw new HttpError('Неизвестный формат проекта', 400);
    const weeklySchedule = validateProjectSchedule(kind, data.weeklySchedule ?? []);

    return ProjectRepository.create({
      ...data,
      placeId,
      locationId,
      passportId: passport.id,
      kind,
      weeklySchedule,
    });
  }

  static async update(projectId: number, data: CreateProject, passportId: number) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new HttpError('Проект не найден', 404);
    if (project.passportId !== passportId) throw new HttpError('Нет доступа к проекту', 403);
    const placeId = requireId(data.placeId, 'центра');
    if (!await PlaceRepository.findById(placeId)) throw new HttpError('Центр не найден', 404);
    const locationId = await this.validateLocation(placeId,
      data.locationId === undefined && placeId === project.placeId ? project.locationId : data.locationId);
    const hasScheduleChange = data.kind !== undefined || data.weeklySchedule !== undefined;
    const kind = data.kind ?? project.kind ?? 'project';
    if (kind !== 'project' && kind !== 'regular') throw new HttpError('Неизвестный формат проекта', 400);
    const weeklySchedule = hasScheduleChange
      ? validateProjectSchedule(kind, data.weeklySchedule ?? project.weeklySchedule ?? []) : undefined;
    return ProjectRepository.update(projectId, {
      title: data.title, description: data.description, image: data.image,
      placeId, locationId, ideaId: data.ideaId,
      ...(hasScheduleChange ? { kind, weeklySchedule } : {}),
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
    if (params.q !== undefined && (typeof params.q !== 'string' || params.q.length > 200)) {
      throw new HttpError('Поисковый запрос должен быть строкой до 200 символов', 400);
    }
    params = { ...params, upcomingOnly: params.upcomingOnly === true || params.upcomingOnly === 'true' };
    const projects = await ProjectRepository.findAll(params);
    const [ideas, users, passports, places, meetRows, locations] = await Promise.all([
      IdeaService.findByIds(projects.flatMap(project => project.ideaId ? [project.ideaId] : [])),
      ParticipantsService.forProjects(projects.map(project => project.id)),
      PassportRepository.findByIds(projects.map(project => project.passportId)),
      PlaceRepository.findByIds(projects.map(project => project.placeId)),
      MeetRepository.findByProjectIds(projects.map(project => project.id), true),
      PlaceLocationRepository.findByIds(projects.flatMap(project => project.locationId ? [project.locationId] : [])),
    ]);
    const meets = await MeetService.hydrateAll(meetRows);
    const ideaById = new Map(ideas.map(idea => [idea.id, idea]));
    const passportById = new Map(passports.map(passport => [passport.id, passport]));
    const placeById = new Map(places.map(place => [place.id, place]));
    const locationById = new Map(locations.map(location => [location.id, location]));
    const meetsByProject = new Map<number, typeof meets>();
    for (const meet of meets) {
      const group = meetsByProject.get(meet.projectId) ?? [];
      group.push(meet);
      meetsByProject.set(meet.projectId, group);
    }
    return selectShowcaseProjects(projects.map(project => {
      const passport = passportById.get(project.passportId);
      const place = placeById.get(project.placeId);
      if (!passport || !place) throw new HttpError('Не найдены связанные данные проекта', 500);
      const location = project.locationId ? locationById.get(project.locationId) : undefined;
      return {
        id: project.id, title: project.title, description: project.description, image: project.image,
        kind: project.kind ?? 'project', weeklySchedule: project.weeklySchedule ?? [],
        locationId: project.locationId ?? null,
        location: location?.placeId === place.id ? { id: location.id, title: location.title } : null,
        idea: project.ideaId ? ideaById.get(project.ideaId) ?? null : null,
        users: users.get(project.id) ?? [], passport, place, meets: meetsByProject.get(project.id) ?? [],
      };
    }), params);
  }

  static async findById(projectId: number, viewer?: Viewer): Promise<ProjectDto> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new HttpError('NOT_FOUND', 404);

    const [passport, users, meets, place, idea, joins, locations] = await Promise.all([
      PassportRepository.findById(project.passportId as number) as Promise<Passport>,
      UserRepository.findByProjectId(projectId),
      MeetRepository.findByProjectId(projectId, viewer?.role === 'teacher'),
      PlaceRepository.findById(project.placeId) as Promise<Place>,
      project.ideaId ? IdeaService.findById(project.ideaId) : null,
      ProjectUserRepository.findByProjectId(project.id) as Promise<ProjectUser[]>,
      PlaceLocationRepository.findByIds(project.locationId ? [project.locationId] : []),
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
      location: locations[0]?.placeId === project.placeId ? { id: locations[0].id, title: locations[0].title } : null,
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
