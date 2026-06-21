import ProjectRepository from '../repositories/project.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import UserRepository from '../repositories/user.repository.js';
import type { Passport } from '../entities/passport.js';
import type { DeleteProjectUser } from '@shared/types';

function getPassportUserIds(passportId: number) {
  // если у тебя раньше был req.users — лучше заменить на нормальный сервис/запрос
  // здесь упрощённая версия: получаем пользователей по passportId
  return UserRepository.findByPassportId(passportId).then(users => users.map(u => u.id));
}

export class ProjectUserService {
  /**
   * Добавление пользователя в проект
   */
  static async create(passport: Passport, body: any) {
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      throw new Error('projectId и userId обязательны');
    }

    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new Error('Проект не найден');
    }

    const existing = await ProjectUserRepository.findByUserAndProjectIds(userId, projectId);
    if (existing) {
      throw new Error('Вы уже состоите в проекте');
    }

    const allowedIds = await getPassportUserIds(passport.id);

    if (!allowedIds.includes(userId)) {
      throw new Error('Нельзя добавлять участника отличного от себя');
    }

    const id = await ProjectUserRepository.create({
      projectId,
      userId,
    });

    return { id };
  }

  /**
   * Удаление пользователя из проекта
   */
  static async remove(passportId: number, body: DeleteProjectUser) {
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      throw new Error('projectId и userId обязательны');
    }

    const exists = await ProjectUserRepository.findByUserAndProjectIds(userId, projectId);
    if (!exists) {
      throw new Error('Участие в проекте не существует');
    }

    const allowedUsers = await UserRepository.findByPassportId(passportId);
    const allowedUserIds = allowedUsers.map(u => u.id);

    if (!allowedUserIds.includes(Number(userId))) {
      throw new Error('Нет прав на удаление');
    }

    await ProjectUserRepository.delete({ projectId, userId });

    return true;
  }
}