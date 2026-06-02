import ProjectUser from '../models/projectUser.js';
import Project from '../models/project.js';

function getPassportUserIds(req) {
  return (req.users || []).map(user => user.id);
}

export default {
  create: async (req, res) => {
    try {
      // 1. Проверяем, существует ли проект
      const project = await Project.findById(req.body.projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // 2. Проверяем, не состоит ли пользователь уже в проекте
      const currentProjectUser = await ProjectUser.findByUserAndProjectIds(
        req.body.userId,
        req.body.projectId,
      );
      if (currentProjectUser) {
        return res.status(409).json({ error: true, message: 'Вы уже состоите в проекте' });
      }

      // 3. Проверяем права доступа (можно ли добавлять этого пользователя)
      if (!getPassportUserIds(req).includes(req.body.userId)) {
        return res
          .status(403)
          .json({ error: true, message: 'Нельзя добавлять участника отличного от себя' });
      }

      // 4. Создаем участие
      const projectUser = new ProjectUser(req.body);
      const projectUserId = await ProjectUser.create(projectUser);

      // Возвращаем ID созданной записи
      res.status(201).json(projectUserId);
    } catch (err) {
      console.error('projectUser.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать участие в проекте' });
    }
  },

  delete: async (req, res) => {
    try {
      // 1. Находим участие по ID из параметров запроса
      const projectUser = await ProjectUser.findById(req.params.id);
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
      const isProjectOwner = project.passportId === req.passport.id;

      if (!isOwnChild && !isProjectOwner) {
        return res.status(403).json({ error: true, message: 'Нет прав на удаление' });
      }

      // 4. Удаляем участие
      await ProjectUser.delete(projectUser.id);

      res.json({ error: false, message: 'Удаление участия в проекте' });
    } catch (err) {
      console.error('projectUser.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить участие в проекте' });
    }
  },
};
