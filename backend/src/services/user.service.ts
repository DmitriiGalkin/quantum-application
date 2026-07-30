import UserRepository from '../repositories/user.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';

import type { User } from '../entities/user.js';
import type { Passport } from '../entities/passport.js';
import type { CreateUserInput, UpdateUserInput } from '../entities/user.types.js';
import { TeacherDashboardDto, UserDashboardDto } from '@shared/types';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { MeetService } from './meet.service.js';
import { ProjectService } from './project.service.js';

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
      throw new Error('Участник не найден');
    }

    if (user.passportId !== passport.id) {
      throw new Error('Нет прав на изменение');
    }

    await UserRepository.update(userId, body);
  }

  // ✅ DELETE
  static async remove(passport: Passport, userId: number): Promise<void> {
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

  // ✅ FIND
  static async findById(id: number): Promise<User | null> {
    return await UserRepository.findById(id);
  }

  static async getDashboard(userId: number): Promise<UserDashboardDto> {
    const user = await UserRepository.findById(userId);
    const projects = await ProjectService.findAll({
      userId,
    });

    return {
      projects,
    };
  }
}
