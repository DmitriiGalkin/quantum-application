import IdeaRepository from '../../../repositories/idea.repository.js';
import IdeaUserRepository from '../../../repositories/idea-user.repository.js';
import UserRepository from '../../../repositories/user.repository.js';
import { Context } from '../../chat/chat.meta.js';


export class IdeaFlowService {
  static async create(context: Context) {
    const userId = await UserRepository.create({
      ...context.user!,
      passportId: context.passport!.id,
    });

    const ideaId = await IdeaRepository.create({
      ...context.idea!,
      userId,
      passportId: context.passport!.id,
      image: '',
    });

    await IdeaUserRepository.create({ ideaId, userId });

    return ideaId;
  }
}
