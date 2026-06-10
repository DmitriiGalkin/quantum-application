import IdeaRepository from '../../../repositories/idea.repository.js';
import IdeaUserRepository from '../../../repositories/idea-user.repository.js';
import UserRepository from '../../../repositories/user.repository.js';

import type { Meta } from '@shared/types';

export class IdeaFlowService {
  static async create(meta: Meta) {
    const userId = await UserRepository.create({
      ...meta.user!,
      passportId: meta.passport!.id,
    });

    const ideaId = await IdeaRepository.create({
      ...meta.idea!,
      userId,
      passportId: meta.passport!.id,
      image: '',
    });

    await IdeaUserRepository.create({ ideaId, userId });

    return {
      content: `Идея создана: <a href="/idea/${ideaId}">перейти</a>.`,
      target: 'idea',
    };
  }
}
