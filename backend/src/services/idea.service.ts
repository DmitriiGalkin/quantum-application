import UserRepository from '../repositories/user.repository.js';
import type { PageMeta } from '@shared/types';
import IdeaRepository from '../repositories/idea.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import { generateIdeaImage, uploadImage } from './assistant/assistants/image.assistant.js';
import {Idea, IdeaExtendedEntity, IdeaFullEntity} from '../entities/idea.js';
import PlaceRepository from '../repositories/place.repository.js';
import MeetRepository from "../repositories/meet.repository.js";
import {User} from "../entities/user.js";

export class IdeaService {
  static async findAll(params: { userId?: number }): Promise<IdeaExtendedEntity[]> {
    const ideas = await IdeaRepository.findAll(params);

    const users = await Promise.all(ideas.map(i => UserRepository.findById(i.userId) as Promise<User>));

    return ideas.map((idea, i) => ({
      ...idea,
      user: users[i],
    }));
  }

  static async findById(id: number): Promise<IdeaFullEntity | null> {
    const idea = await IdeaRepository.findById(id);
    if (!idea) return null;

    const [user, projects] = await Promise.all([UserRepository.findById(idea.userId || 0), ProjectRepository.findByIdeaId(idea.id)]);

    if (!user) throw new Error('IdeaService findById: не найден пользователь идеи');

    const usersForProjects = await Promise.all(projects.map(p => UserRepository.findByProjectId(p.id)));

    const meetsForProjects = await Promise.all(projects.map(p => MeetRepository.findByProjectId(p.id)));

    const projectPassports = await Promise.all(projects.map(p => PassportRepository.findById(p.passportId)));

    const projectPlaces = await Promise.all(projects.map(p => (p.placeId ? PlaceRepository.findById(p.placeId) : null)));

    return {
      ...idea,
      user,
      projects: projects.map((project, idx) => ({
        ...project,
        idea,
        passport: projectPassports[idx],
        place: projectPlaces[idx],
        users: usersForProjects[idx],
        meets: meetsForProjects[idx],
      })),
    };
  }

  static async generateIdeaImage(projectId: number) {
    const idea = await IdeaRepository.findById(projectId);
    if (!idea) return null;

    const imageBinary = await generateIdeaImage(idea);
    const image = await uploadImage(imageBinary);

    await IdeaRepository.update(projectId, { ...idea, image });

    return idea;
  }

  static async meta(id: number) {
    const idea = await IdeaRepository.findById(id);
    if (!idea) throw new Error('idea.service meta: не найдена идея');

    return {
      title: idea.title,
      description: idea.description,
      ogType: 'article',
      ogTitle: idea.title,
      ogDescription: idea.description,
    } as PageMeta;
  }
}
