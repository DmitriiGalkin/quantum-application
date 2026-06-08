import type { PassportDto } from '@shared/types';
import ProjectRepository from '../models/project.repository.js';
import ProjectUserRepository from '../models/projectUser.repository.js';
import UserRepository from '../models/user.repository.js';

function getPassportUserIds(passportId: number) {
  // если у тебя раньше был req.users — лучше заменить на нормальный сервис/запрос
  // здесь упрощённая версия: получаем пользователей по passportId
  return UserRepository.findByPassportId(passportId).then(users => users.map(u => u.id));
}

export class ProjectUserService {
  /**
   * Добавление пользователя в проект
   */
  static async create(passport: PassportDto, body: any) {
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
  static async remove(passport: PassportDto, participationId: number) {
    const projectUser = await ProjectUserRepository.findById(participationId);

    if (!projectUser) {
      throw new Error('Участие не существует');
    }

    const project = await ProjectRepository.findById(projectUser.projectId);

    if (!project) {
      throw new Error('Связанный проект не найден');
    }

    const allowedIds = await getPassportUserIds(passport.id);

    const isOwnChild = allowedIds.includes(projectUser.userId);
    const isProjectOwner = project.passportId === passport.id;

    if (!isOwnChild && !isProjectOwner) {
      throw new Error('Нет прав на удаление');
    }

    await ProjectUserRepository.delete(projectUser.id);

    return true;
  }
}