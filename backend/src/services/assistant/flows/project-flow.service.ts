import ProjectRepository from '../../../repositories/project.repository.js';
import IdeaRepository from '../../../repositories/idea.repository.js';
import { Context } from '../../chat/chat.meta.js';
import PassportRepository from '../../../repositories/passport.repository.js';

export class ProjectFlowService {
  static async create(context: Context) {
    if (!context?.teacher && context.passport && context.draftTeacher)
      await PassportRepository.update(context.passport.id, { description: context.draftTeacher.description });

    const idea = await IdeaRepository.findById(context.draftProject!.ideaId);

    if (!idea) throw new Error('Странно: не нашлась идея');

    return await ProjectRepository.create({
      ...context.draftProject!,
      passportId: context.passport!.id,
      ideaId: idea.id,
      title: idea.title,
      description: idea.description,
    });
  }
}
