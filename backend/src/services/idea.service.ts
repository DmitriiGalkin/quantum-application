import UserRepository from '../repositories/user.repository.js';
import type { PageMeta } from '@shared/types';
import IdeaRepository from '../repositories/idea.repository.js';
import IdeaUserRepository from '../repositories/idea-user.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import { generateIdeaImage, uploadImage } from './assistant/assistants/image.assistant.js';
import { IdeaFullEntity } from '../entities/idea.js';

export class IdeaService {
  static async findAll(params: { userId?: number }): Promise<IdeaFullEntity[]> {
    const ideas = await IdeaRepository.findAll(params);

    const [users] = await Promise.all([Promise.all(ideas.map(i => UserRepository.findById(i.userId)))]);

    return ideas.map((idea, i) => ({
      ...idea,
      user: users[i],
    }));
  }
  static async findById(id: number): Promise<IdeaFullEntity | null> {
    const idea = await IdeaRepository.findById(id);
    if (!idea) return null;

    const [user, projects] = await Promise.all([UserRepository.findById(idea.userId || 0), ProjectRepository.findByIdeaId(idea.id)]);

    const usersForProjects = await Promise.all(projects.map(p => UserRepository.findByProjectId(p.id)));

    const projectPassports = await Promise.all(projects.map(p => PassportRepository.findById(p.passportId)));

    return {
      ...idea,
      user,
      projects: projects.map((project, idx) => ({
        ...project,
        passport: projectPassports[idx],
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
