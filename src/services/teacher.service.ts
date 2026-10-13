import UserRepository from '../repositories/user.repository.js';
import type { TeacherDashboardDto, TeacherPublicDto, MeetDto } from 'entities';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { MeetService } from './meet.service.js';
import PassportRepository from '../repositories/passport.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import { ParticipantsService } from './participants.service.js';
import { HttpError } from '../utils/http-error.js';
import { IdeaService } from './idea.service.js';

export class TeacherService {
  static async getDashboard(passportId: number): Promise<TeacherDashboardDto> {
    const [projects, bmeets] = await Promise.all([
      ProjectRepository.findAll({ passportId }),
      MeetService.findAll({ passportId }),
    ]);
    const users = await ParticipantsService.forProjects(projects.map(project => project.id));
    const studentIds = new Set([...users.values()].flat().map(user => user.id));

    return {
      projects: projects.length,
      meets: bmeets.length,
      students: studentIds.size,
      debit: null,

      bmeets,
    };
  }

  static async findById(id: number): Promise<TeacherPublicDto | null> {
    const passport = await PassportRepository.findById(id);
    if (!passport) return null;

    const [projects, ideas, centers] = await Promise.all([
      ProjectRepository.findAll({ passportId: id }),
      IdeaRepository.findByTeacherId(id),
      PlaceRepository.findByPassportId(id),
    ]);

    const [usersByProject, places, meetRows, ideaUsers, projectIdeas] = await Promise.all([
      ParticipantsService.forProjects(projects.map(project => project.id)),
      PlaceRepository.findByIds(projects.map(project => project.placeId)),
      MeetRepository.findByProjectIds(projects.map(project => project.id), true),
      UserRepository.findByIds(ideas.flatMap(idea => idea.userId ? [idea.userId] : [])),
      IdeaService.findByIds(projects.flatMap(project => project.ideaId ? [project.ideaId] : [])),
    ]);
    const meets = await MeetService.hydrateAll(meetRows);
    const placeById = new Map(places.map(place => [place.id, place]));
    const userById = new Map(ideaUsers.map(user => [user.id, user]));
    const ideaById = new Map(projectIdeas.map(idea => [idea.id, idea]));
    const meetsByProject = new Map<number, MeetDto[]>();
    for (const meet of meets) {
      const group = meetsByProject.get(meet.projectId) ?? [];
      group.push(meet);
      meetsByProject.set(meet.projectId, group);
    }

    const projectExtendeds = projects.map(project => {
      const place = placeById.get(project.placeId);
      if (!place) throw new HttpError('Не найдены связанные данные проекта', 500);
      return {
        ...project,
        passport,
        place,
        meets: meetsByProject.get(project.id) ?? [],
        users: usersByProject.get(project.id) ?? [],
        idea: project.ideaId ? ideaById.get(project.ideaId) ?? null : null,
      };
    });

    const ideaExtendeds = ideas.map(idea => ({
      ...idea,
      user: userById.get(idea.userId) ?? null,
    }));

    const students = new Set([...usersByProject.values()].flat().map(user => user.id)).size;

    return {
      passport,
      projects: projectExtendeds,
      ideas: ideaExtendeds,
      meets: meets.length,
      students,
      centersCount: centers.length,
      centers,
    };
  }
}
