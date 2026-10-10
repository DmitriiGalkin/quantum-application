import { HttpError } from '../utils/http-error.js';
import UserRepository from '../repositories/user.repository.js';
import IdeaUserRepository from '../repositories/idea-user.repository.js';
import type { CreateIdeaUser, DeleteIdeaUser } from 'entities';

export class IdeaUserService {
  static async create(passportId: number, body: CreateIdeaUser) {
    const { ideaId, userId } = body;

    if (!ideaId || !userId) {
      throw new HttpError('ideaId и userId обязательны', 400);
    }

    const exists = await IdeaUserRepository.findByIdeaAndUserIds(ideaId, userId);
    if (exists) {
      throw new HttpError('Участие уже существует', 409);
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);
    const allowedUserIds = allowedUsers.map(u => u.id);

    if (!allowedUserIds.includes(Number(userId))) {
      throw new HttpError('Нет прав на лайк этим юзверем', 403);
    }

    return IdeaUserRepository.create({ ideaId, userId });
  }

  static async remove(passportId: number, body: DeleteIdeaUser) {
    const { ideaId, userId } = body;

    if (!ideaId || !userId) {
      throw new HttpError('ideaId и userId обязательны', 400);
    }

    const exists = await IdeaUserRepository.findByIdeaAndUserIds(ideaId, userId);
    if (!exists) {
      throw new HttpError('Участие не существует2', 404);
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);

    if (!allowedUsers.map(u => u.id).includes(Number(userId))) {
      throw new HttpError('Нет прав на удаление', 403);
    }

    await IdeaUserRepository.delete({ ideaId, userId });
  }
}
