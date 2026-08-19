import Meet from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import UserRepository from '../repositories/user.repository.js';
import { CreateMeetUser, DeleteMeetUser } from 'types';

export class MeetUserService {
  static async create(passportId: number, body: CreateMeetUser) {
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

    const allowedUsers = await UserRepository.findByPassportId(passportId);

    if (!allowedUsers.map(u => u.id).includes(userId)) {
      throw new Error('Нельзя добавлять чужого участника');
    }

    return MeetUserRepository.create({ meetId, userId });
  }

  static async remove(passportId: number, body: DeleteMeetUser) {
    const { meetId, userId } = body;

    if (!meetId || !userId) {
      throw new Error('meetId и userId обязательны');
    }

    const exists = await MeetUserRepository.findByUserAndMeetIds(userId, meetId);
    if (!exists) {
      throw new Error('Участие на встрече не существует2');
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);
    const allowedUserIds = allowedUsers.map(u => u.id);

    if (!allowedUserIds.includes(Number(userId))) {
      throw new Error('Нет прав на удаление');
    }

    await MeetUserRepository.delete({ meetId, userId });
  }

  static async findAll(userId: number) {
    const [rows] = await MeetUserRepository.findAll(userId);
    return rows;
  }
}
