import ProjectRepository from '../../../repositories/project.repository.js';
import IdeaRepository from '../../../repositories/idea.repository.js';
import { Meta } from '../../chat/chat.meta.js';

export class ProjectFlowService {
  static async create(meta: Meta) {
    const idea = await IdeaRepository.findById(meta.project!.id);

    return await ProjectRepository.create({
      ...meta.project!,
      passportId: meta.passport!.id,
      ideaId: meta.project!.id,
      title: idea?.title,
      description: idea?.description,
    });
  }
}
