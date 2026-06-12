import IdeaRepository from '../../../repositories/idea.repository.js';
import IdeaUserRepository from '../../../repositories/idea-user.repository.js';
import UserRepository from '../../../repositories/user.repository.js';
import { Context } from '../../chat/chat.meta.js';

export class IdeaFlowService {
  static async create(context: Context) {
    const userId = !context.user
      ? await UserRepository.create({
          ...context.draftUser!,
          passportId: context.passport!.id,
        })
      : context.user.id;

    const ideaId = await IdeaRepository.create({
      ...context.draftIdea!,
      userId,
      passportId: context.passport!.id,
    });

    await IdeaUserRepository.create({ ideaId, userId });

    return ideaId;
  }
}
