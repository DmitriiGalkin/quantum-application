import { HttpError } from '../utils/http-error.js';
import Meet from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import UserRepository from '../repositories/user.repository.js';
import type { CreateMeetUser, DeleteMeetUser } from 'entities';

export class MeetUserService {
  static async create(passportId: number, body: CreateMeetUser) {
    const { meetId, userId } = body;

    if (!meetId || !userId) {
      throw new HttpError('meetId и userId обязательны', 400);
    }

    const meet = await Meet.findById(meetId);
    if (!meet) {
      throw new HttpError('Встреча не найдена', 404);
    }

    const exists = await MeetUserRepository.findByUserAndMeetIds(userId, meetId);
    if (exists) {
      throw new HttpError('Участие уже существует', 409);
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);

    if (!allowedUsers.map(u => u.id).includes(userId)) {
      throw new HttpError('Нельзя добавлять чужого участника', 403);
    }

    return MeetUserRepository.create({ meetId, userId });
  }

  static async remove(passportId: number, body: DeleteMeetUser) {
    const { meetId, userId } = body;

    if (!meetId || !userId) {
      throw new HttpError('meetId и userId обязательны', 400);
    }

    const exists = await MeetUserRepository.findByUserAndMeetIds(userId, meetId);
    if (!exists) {
      throw new HttpError('Участие на встрече не существует2', 404);
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);
    const allowedUserIds = allowedUsers.map(u => u.id);

    if (!allowedUserIds.includes(Number(userId))) {
      throw new HttpError('Нет прав на удаление', 403);
    }

    await MeetUserRepository.delete({ meetId, userId });
  }

  static async findAll(userId: number) {
    if (!userId) {
      throw new Error('userId обязателен');
    }

    return MeetUserRepository.findAll(userId);
  }
}
