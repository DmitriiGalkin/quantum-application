import type { Passport, User as IUser } from '@shared/types';
import UserRepository from '../models/user.repository.js';
import ProjectUserRepository from '../models/projectUser.repository.js';

export class UserService {
  static async create(passport: Passport, body: IUser) {
    const id = await UserRepository.create({
      ...body,
      passportId: passport.id,
    } as IUser);

    return { id };
  }

  static async update(passport: Passport, body: IUser) {
    await UserRepository.update(body as IUser);
  }

  static async remove(passport: Passport, userId: number) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('Участник не найден');
    }

    if (user.passportId !== passport.id) {
      throw new Error('Нет прав на удаление этого участника');
    }

    await ProjectUserRepository.deleteByUserId(String(userId));
    await UserRepository.delete(userId);
  }

  static async findById(id: number) {
    return await UserRepository.findById(id);
  }
}
