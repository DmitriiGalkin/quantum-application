import { HttpError } from '../utils/http-error.js';
import Meet from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import UserRepository from '../repositories/user.repository.js';
import type { CreateMeetUser, DeleteMeetUser } from 'entities';
import { db } from '../utils/dbNext.js';

export class MeetUserService {
  static async create(passportId: number, body: CreateMeetUser) {
    const { meetId, userId } = body;

    if (!meetId || !userId) {
      throw new HttpError('meetId и userId обязательны', 400);
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);

    if (!allowedUsers.map(u => u.id).includes(userId)) {
      throw new HttpError('Нельзя добавлять чужого участника', 403);
    }

    return db.transaction(async conn => {
      const meet = await Meet.findById(meetId, conn);
      if (!meet || meet.deletedAt) throw new HttpError('Встреча не найдена', 404);
      const participants = await MeetUserRepository.findParticipants(meetId, conn);
      if (participants.some(p => p.userId === userId)) throw new HttpError('Участие уже существует', 409);
      if (meet.status !== 'published') throw new HttpError('Запись доступна только на подтверждённую встречу', 409);
      if (meet.maxParticipants !== null && participants.length >= meet.maxParticipants) throw new HttpError('Мест нет', 409);
      return MeetUserRepository.create({ meetId, userId }, conn);
    });
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
