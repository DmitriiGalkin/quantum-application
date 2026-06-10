import UserRepository from '../repositories/user.repository.js';
import type { IParams, PageMeta } from '@shared/types';
import IdeaRepository from '../repositories/idea.repository.js';
import IdeaUserRepository from '../repositories/idea-user.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import { generateIdeaImage, uploadImage } from '../ai/assistants/image.assistant.js';

export class IdeaService {
  static async findAll(params: IParams) {
    const ideas = await IdeaRepository.findAll(params);

    const [users, ideaUsers] = await Promise.all([
      Promise.all(ideas.map(i => UserRepository.findById(i.userId))),
      Promise.all(ideas.map(i => IdeaUserRepository.findByIdeaId(i.id))),
    ]);

    return ideas.map((idea, i) => ({
      ...idea,
      user: users[i],
      ideaUsers: ideaUsers[i],
    }));
  }
  static async findById(id: number) {
    const idea = await IdeaRepository.findById(id);
    if (!idea) return null;

    const [passport, user, projects, ideaUsers] = await Promise.all([
      PassportRepository.findById(idea.passportId || 0),
      UserRepository.findById(idea.userId || 0),
      ProjectRepository.findByIdeaId(idea.id),
      IdeaUserRepository.findByIdeaId(idea.id),
    ]);

    const usersForProjects = await Promise.all(projects.map(p => UserRepository.findByProjectId(p.id)));

    const projectPassports = await Promise.all(projects.map(p => PassportRepository.findById(p.passportId)));

    const projectPlaces = await Promise.all(projects.map(p => PlaceRepository.findById(p.placeId)));

    return {
      ...idea,
      passport,
      user,
      projects: projects.map((project, idx) => ({
        ...project,
        passport: projectPassports[idx],
        place: projectPlaces[idx],
        users: usersForProjects[idx],
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
