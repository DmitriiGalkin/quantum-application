import ProjectRepository from '../../../repositories/project.repository.js';
import type { Meta } from '@shared/types';

export class ProjectFlowService {
  static async create(meta: Meta) {
    const projectId = await ProjectRepository.create({
      ...meta.project!,
      passportId: meta.passport!.id,
      ideaId: meta.project!.id,
    });

    return {
      content: `Проект создан: <a href="/project/${projectId}">перейти</a>.`,
      target: 'project',
    };
  }
}
