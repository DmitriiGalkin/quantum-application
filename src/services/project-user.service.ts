import { HttpError } from '../utils/http-error.js';
import ProjectRepository from '../repositories/project.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import UserRepository from '../repositories/user.repository.js';
import type { Passport, CreateProjectUser } from 'entities';

export function getPassportUserIds(passportId: number) {
  // если у тебя раньше был req.users — лучше заменить на нормальный сервис/запрос
  // здесь упрощённая версия: получаем пользователей по passportId
  return UserRepository.findByPassportId(passportId).then(users => users.map(u => u.id));
}

export class ProjectUserService {
  /**
   * Добавление пользователя в проект
   */
  static async create(passport: Passport, body: CreateProjectUser) {
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      throw new HttpError('projectId и userId обязательны', 400);
    }

    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new HttpError('Проект не найден', 404);
    }

    const existing = await ProjectUserRepository.findByUserAndProjectIds(userId, projectId);
    if (existing) {
      throw new HttpError('Вы уже состоите в проекте', 409);
    }

    const allowedIds = await getPassportUserIds(passport.id);

    if (!allowedIds.includes(userId)) {
      throw new HttpError('Нельзя добавлять участника отличного от себя', 403);
    }

    const id = await ProjectUserRepository.create({
      projectId,
      userId,
    });

    return { id };
  }

  /**
   * Выход пользователя из проекта
   */
  static async leave(projectId: number, userId: number) {
    if (!projectId || !userId) {
      throw new HttpError('projectId и userId обязательны', 400);
    }

    const exists = await ProjectUserRepository.findByUserAndProjectIds(userId, projectId);
    if (!exists) {
      throw new HttpError('Участие в проекте не существует', 404);
    }

    await ProjectUserRepository.delete(projectId, userId );

    return true;
  }
}
