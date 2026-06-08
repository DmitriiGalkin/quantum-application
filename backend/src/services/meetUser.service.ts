import Meet from '../models/meet.repository.js';
import MeetUserRepository from '../models/meetUser.repository.js';
import UserRepository from '../models/user.repository.js';
import type { Passport } from '../entities/passport.js';

export class MeetUserService {
  static async create(passport: Passport, body: any) {
    const { meetId, userId } = body;

    if (!meetId || !userId) {
      throw new Error('meetId и userId обязательны');
    }

    const meet = await Meet.findById(meetId);
    if (!meet) {
      throw new Error('Встреча не найдена');
    }

    const exists = await MeetUserRepository.findByUserAndMeetIds(userId, meetId);
    if (exists) {
      throw new Error('Участие уже существует');
    }

    const allowedUsers = await UserRepository.findByPassportId(passport.id || 0);

    if (!allowedUsers.map(u => u.id).includes(userId)) {
      throw new Error('Нельзя добавлять чужого участника');
    }

    return MeetUserRepository.create({ meetId, userId });
  }

  static async remove(passport: Passport, id: number) {
    const meetUser = await MeetUserRepository.findById(id);

    if (!meetUser) {
      throw new Error('Участие не существует');
    }

    const allowedUsers = await UserRepository.findByPassportId(passport.id || 0);

    if (!allowedUsers.map(u => u.id).includes(meetUser.userId)) {
      throw new Error('Нет прав на удаление');
    }

    await MeetUserRepository.delete(id);
  }

  static async findAll(userId: number) {
    const [rows] = await MeetUserRepository.findAll(userId);
    return rows;
  }
}
