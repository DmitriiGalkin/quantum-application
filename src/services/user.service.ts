import { HttpError } from '../utils/http-error.js';
import UserRepository from '../repositories/user.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';

import type { UserDashboardDto, User, Passport, CreateUserInput, UpdateUserInput } from 'entities';
import { ProjectService } from './project.service.js';
import { db } from '../utils/dbNext.js';

export class UserService {
  // ✅ CREATE
  static async create(passport: Passport, body: CreateUserInput): Promise<number> {
    const id = await UserRepository.create({
      ...body,
      passportId: passport.id,
    });

    return id;
  }

  // ✅ UPDATE
  static async update(passport: Passport, userId: number, body: UpdateUserInput): Promise<void> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new HttpError('Участник не найден', 404);
    }

    if (user.passportId !== passport.id) {
      throw new HttpError('Нет прав на изменение', 403);
    }

    await UserRepository.update(userId, body);
  }

  // ✅ DELETE
  static async remove(passport: Passport, userId: number): Promise<void> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new HttpError('Участник не найден', 404);
    }

    if (user.passportId !== passport.id) {
      throw new HttpError('Нет прав на удаление этого участника', 403);
    }

    await db.transaction(async conn => {
      await ProjectUserRepository.deleteByUserId(userId, conn);
      await UserRepository.delete(userId, conn);
    });
  }

  // ✅ FIND
  static async findById(id: number): Promise<User | null> {
    return await UserRepository.findById(id);
  }

  static async getDashboard(userId: number): Promise<UserDashboardDto> {
    const projects = await ProjectService.findAll({
      userId,
    });

    return {
      projects,
    };
  }
}
