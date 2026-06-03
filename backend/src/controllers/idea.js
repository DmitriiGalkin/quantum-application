import User from '../models/user.ts';
import Passport from '../models/passport.js';
import Idea from "../models/idea.js";
import IdeaUser from "../models/ideaUser.js";

export default {
  findAll: async (req, res) => {
    console.log('req.query',req.query)
    try {
      // Передаем параметры запроса и ID текущего пользователя
      const params = { ...req.query, passportId: req.passport?.id };

      const ideas = await Idea.findAll(params);

      const [ideaUsers] = await Promise.all([
        Promise.all(ideas.map(p => IdeaUser.findByIdeaId(p.id))),
      ]);

      const response = ideas.map((idea, index) => ({
        ...idea,
        ideaUsers: ideaUsers[index],
      }));

      res.json(response);
    } catch (err) {
      console.error('idea.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить идеи' });
    }
  },

  findById: async (req, res) => {
    try {
      const ideaId = req.params.id;

      // Получаем базовую информацию о проекте
      const idea = await Idea.findById(ideaId);
      if (!idea) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // Получаем все связанные данные параллельно для ускорения
      const [ passport, user] = await Promise.all([
        Passport.findById(idea.passportId),
        User.findById(idea.userId),
      ]);

      const [ideaUsers] = await Promise.all([
        IdeaUser.findByIdeaId(ideaId),
      ]);

      // Получаем пользователей для участников проекта
      const usersForIdeaUsers = await Promise.all(
          ideaUsers.map(p => User.findById(p.userId)),
      );

      // Формируем финальный объект ответа
      res.json({
        ...idea,
        passport,
        user,
        ideaUsers: ideaUsers.map((p, idx) => ({
          ...p,
          user: usersForIdeaUsers[idx],
        })),
      });
    } catch (err) {
      console.error('idea.findById error:', err);
      res.status(500).send({ error: true, message: 'Не удалось получить идею' });
    }
  },
};
