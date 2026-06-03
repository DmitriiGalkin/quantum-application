import ProjectUser from '../models/projectUser.js';
import Project from '../models/project.js';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router';
import { ProjectUser as IProjectUser } from '../../../application/src/types'; // Импортируем пул соединений

// Вспомогательная функция остается без изменений, так как она работает с объектами req.users
function getPassportUserIds(req: RequestWithPassport) {
  return (req.users || []).map(user => user.id);
}

export default {
  /**
   * Добавление пользователя в проект
   */
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      const { projectId, userId } = req.body as any;

      if (!projectId || !userId) {
        return res.status(400).json({ error: true, message: 'projectId и userId обязательны' });
      }

      // 1. Проверяем, существует ли проект
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // 2. Проверяем, не состоит ли пользователь уже в проекте
      const currentProjectUser = await ProjectUser.findByUserAndProjectIds(
        userId,
        projectId,
      );
      if (currentProjectUser) {
        return res.status(409).json({ error: true, message: 'Вы уже состоите в проекте' });
      }

      // 3. Проверяем права доступа (можно ли добавлять этого пользователя)
      if (!getPassportUserIds(req).includes(userId)) {
        return res
          .status(403)
          .json({ error: true, message: 'Нельзя добавлять участника отличного от себя' });
      }

      // 4. Создаем участие
      const projectUserId = await ProjectUser.create(req.body as unknown as IProjectUser);

      // Возвращаем ID созданной записи со статусом 201 Created
      res.status(201).json(projectUserId);
    } catch (err) {
      console.error('projectUser.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать участие в проекте' });
    }
  },

  /**
   * Удаление пользователя из проекта
   */
  delete: async (req: RequestWithPassport, res: Response) => {
    try {
      const participationId = req.params.id;

      // 1. Находим участие по ID из параметров запроса
      const projectUser = await ProjectUser.findById(participationId);
      if (!projectUser) {
        return res.status(404).json({ error: true, message: 'Участие не существует' });
      }

      // 2. Находим проект для проверки прав владельца
      const project = await Project.findById(projectUser.projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Связанный проект не найден' });
      }

      // 3. Проверяем права доступа:
      // - Либо это собственный ребенок пользователя (isOwnChild)
      // - Либо пользователь является владельцем проекта (isProjectOwner)
      const isOwnChild = getPassportUserIds(req).includes(projectUser.userId);
      const isProjectOwner = project.passportId === req.passport?.id; // Используем optional chaining

      if (!isOwnChild && !isProjectOwner) {
        return res.status(403).json({ error: true, message: 'Нет прав на удаление' });
      }

      // 4. Удаляем участие
      await ProjectUser.delete(projectUser.id);

      res.json({ error: false, message: 'Удаление участия в проекте прошло успешно' });
    } catch (err) {
      console.error('projectUser.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить участие в проекте' });
    }
  },
};