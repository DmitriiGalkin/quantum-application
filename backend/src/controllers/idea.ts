import User from '../models/user.js'; // Предполагаем, что это .js файл с TS-типами
import Passport from '../models/passport.js';
import Idea, { IParams } from '../models/idea.js';
import IdeaUser from "../models/ideaUser.js";
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router';
import Project from 'models/project';

export default {
  /**
   * Получение списка всех идей с учетом параметров запроса
   */
  findAll: async (req: RequestWithPassport, res: Response) => {
    try {
      const ideas = await Idea.findAll({ ...req.query, passportId: req.passport?.id } as unknown as IParams);

      // Получаем участников для каждой идеи параллельно
      const [users, ideaUsers] = await Promise.all([
        Promise.all(ideas.map(idea => User.findById(idea.userId))),
        Promise.all(ideas.map(p => IdeaUser.findByIdeaId(p.id))),
      ]);

      // Формируем ответ, добавляя информацию об участниках к каждой идее
      const response = ideas.map((idea, index) => ({
        ...idea,
        user: users[index],
        ideaUsers: ideaUsers[index],
      }));

      res.json(response);
    } catch (err) {
      console.error('idea.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить список идей' });
    }
  },

  /**
   * Получение детальной информации о конкретной идее по ID
   */
  findById: async (req: RequestWithPassport, res: Response) => {
    try {
      const ideaId = req.params.id;

      // Получаем базовую информацию об идее
      const idea = await Idea.findById(ideaId);
      if (!idea) {
        return res.status(404).json({ error: true, message: 'Идея не найдена' }); // Исправлено на "Идея"
      }

      // Параллельно получаем создателя идеи и его паспорт
      const [passport, user, projects] = await Promise.all([
        Passport.findById(idea.passportId || 0),
        User.findById(idea.userId || 0),
        Project.findByIdeaId(idea.id),
      ]);

      // Получаем список связей "идея-пользователь" (участников)
      const [ideaUsers] = await Promise.all([
        IdeaUser.findByIdeaId(ideaId),
      ]);

      // Для каждого участника находим его данные
      const usersForIdeaUsers = await Promise.all(
        ideaUsers.map(iu => User.findById(iu.userId))
      );

      // Формируем финальный объект ответа со всеми вложенными данными
      res.json({
        ...idea,
        passport,
        user,
        ideaUsers: ideaUsers.map((iu, idx) => ({
          ...iu,
          user: usersForIdeaUsers[idx], // Добавляем объект пользователя к каждому участнику
        })),
        projects,
      });
    } catch (err) {
      console.error('idea.findById error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить идею' });
    }
  },
};