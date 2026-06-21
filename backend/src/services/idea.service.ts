import UserRepository from '../repositories/user.repository.js';
import { GetIdeasQuery, PageMeta } from '@shared/types';
import IdeaRepository from '../repositories/idea.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import { generateIdeaImage, uploadImage } from './assistant/assistants/image.assistant.js';
import { IdeaExtendedEntity, IdeaFullEntity } from '../entities/idea.js';
import PlaceRepository from '../repositories/place.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { User } from '../entities/user.js';
import { ProjectService } from './project.service.js';

export class IdeaService {
  static async findAll(params: GetIdeasQuery): Promise<IdeaExtendedEntity[]> {
    if (params.sort === 'nearby') {
      if (!params.latitude || !params.longitude) {
        throw new Error('Missing coordinates for nearby sort');
      }
    }

    const ideas = await IdeaRepository.findAll(params);

    const users = await Promise.all(ideas.map(i => UserRepository.findById(i.userId) as Promise<User>));

    return ideas.map((idea, i) => ({
      ...idea,
      user: users[i],
    }));
  }

  static async findById(id: number, params: GetIdeasQuery): Promise<IdeaFullEntity | null> {
    const idea = await IdeaRepository.findById(id);
    if (!idea) return null;

    const [user, projects] = await Promise.all([UserRepository.findById(idea.userId || 0), ProjectService.findAll({ideaId: idea.id})]);

    if (!user) throw new Error('IdeaService findById: не найден пользователь идеи');

    return {
      ...idea,
      user,
      projects,
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
