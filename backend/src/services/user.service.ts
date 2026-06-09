import type { UserDto } from '@shared/types';
import UserRepository from '../repositories/user.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import type { User } from '../entities/user.js';
import type { Passport } from '../entities/passport.js';

export class UserService {
  static async create(passport: Passport, body: UserDto) {
    const id = await UserRepository.create({
      ...body,
      passportId: passport.id,
    } as User);

    return { id };
  }

  static async update(passport: Passport, body: UserDto) {
    await UserRepository.update(body);
  }

  static async remove(passport: Passport, userId: number) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('Участник не найден');
    }

    if (user.passportId !== passport.id) {
      throw new Error('Нет прав на удаление этого участника');
    }

    await ProjectUserRepository.deleteByUserId(userId);
    await UserRepository.delete(userId);
  }

  static async findById(id: number) {
    return await UserRepository.findById(id);
  }
}
