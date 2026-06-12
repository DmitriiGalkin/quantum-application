import ProjectRepository from '../../../repositories/project.repository.js';
import IdeaRepository from '../../../repositories/idea.repository.js';
import { Context } from '../../chat/chat.meta.js';

export class ProjectFlowService {
  static async create(context: Context) {
    const idea = await IdeaRepository.findById(context.project!.ideaId);

    return await ProjectRepository.create({
      ...context.project!,
      passportId: context.passport!.id,
      ideaId: context.project!.id,
      title: idea?.title,
      description: idea?.description,
    });
  }
}
