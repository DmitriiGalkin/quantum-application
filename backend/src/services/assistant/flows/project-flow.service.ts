import ProjectRepository from '../../../repositories/project.repository.js';
import type { Meta } from '@shared/types';
import IdeaRepository from '../../../repositories/idea.repository.js';

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
