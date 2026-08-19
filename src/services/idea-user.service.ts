import UserRepository from '../repositories/user.repository.js';
import IdeaUserRepository from '../repositories/idea-user.repository.js';
import type { DeleteIdeaUser } from 'dto';

export class IdeaUserService {
  static async create(passportId: number, body: any) {
    const { ideaId, userId } = body;

    if (!ideaId || !userId) {
      throw new Error('ideaId и userId обязательны');
    }

    const exists = await IdeaUserRepository.findByIdeaAndUserIds(ideaId, userId);
    if (exists) {
      throw new Error('Участие уже существует');
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);
    const allowedUserIds = allowedUsers.map(u => u.id);

    if (!allowedUserIds.includes(Number(userId))) {
      throw new Error('Нет прав на лайк этим юзверем');
    }

    return IdeaUserRepository.create({ ideaId, userId });
  }

  static async remove(passportId: number, body: DeleteIdeaUser) {
    const { ideaId, userId } = body;

    if (!ideaId || !userId) {
      throw new Error('ideaId и userId обязательны');
    }

    const exists = await IdeaUserRepository.findByIdeaAndUserIds(ideaId, userId);
    if (!exists) {
      throw new Error('Участие не существует2');
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);

    if (!allowedUsers.map(u => u.id).includes(Number(userId))) {
      throw new Error('Нет прав на удаление');
    }

    await IdeaUserRepository.delete({ ideaId, userId });
  }
}
