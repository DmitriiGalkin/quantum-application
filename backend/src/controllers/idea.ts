import User from '../models/user.js'; // Предполагаем, что это .js файл с TS-типами
import Passport from '../models/passport.js';
import Idea from '../models/idea.js';
import type { IIdeaWithRelations, IParams } from '@shared/types'; // Импортируем пул соединений
import IdeaUser from "../models/ideaUser.js";
import { Response } from 'express'; // Импортируем нужные типы
import Project from '../models/project.js';
import Place from '../models/place.js';
import { ControllerWithAuth, ok, fail } from './helper.js';

const findAll: ControllerWithAuth<IIdeaWithRelations[]> = async (req, res) => {
  try {
    const ideas = await Idea.findAll({
      ...req.query,
      passportId: req.passport?.id,
    } as unknown as IParams);

    const [users, ideaUsers] = await Promise.all([
      Promise.all(ideas.map(i => User.findById(i.userId))),
      Promise.all(ideas.map(i => IdeaUser.findByIdeaId(i.id))),
    ]);

    const response= ideas.map((idea, index) => ({
      ...idea,
      user: users[index],
      ideaUsers: ideaUsers[index],
    }));

    ok(res, response);
  } catch (err) {
    console.error('idea.findAll error:', err);
    fail(res, 'Не удалось получить список идей');
  }
};

export default {
  /**
   * Получение списка всех идей с учетом параметров запроса
   */
  findAll,

  // generateImage: async (req: RequestWithPassport, res: Response) => {
  //   try {
  //     // Middleware должен гарантировать наличие req.passport
  //     const projectId = req.params.id;
  //     const project = await Project.findById(projectId);
  //
  //     if (!project) {
  //       return res.status(404).json({ error: true, message: 'Проект не найден' });
  //     }
  //
  //     const imageBinary = await generateProjectImage(project);
  //     const image = await uploadImage(imageBinary);
  //
  //     await Project.update(req.params.id, { ...project, image });
  //
  //     res.json({ error: false, message: 'Изображение проекта обновлено' });
  //   } catch (err) {
  //     console.error('chat.generateImage error:', err);
  //     res.status(500).json({
  //       error: true,
  //       message: 'Не удалось сгенерировать изображение для сообщения',
  //     });
  //   }
  // },

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
      const [ideaUsers] = await Promise.all([IdeaUser.findByIdeaId(ideaId)]);

      // Для каждого участника находим его данные
      const usersForIdeaUsers = await Promise.all(ideaUsers.map(iu => User.findById(iu.userId)));

      // Для каждого участника находим его данные
      const usersForProjects = await Promise.all(projects.map(project => User.findByProjectId(project.id)));
      const projectPassport = await Promise.all(projects.map(project => Passport.findById(project.passportId)));
      const projectPlaces = await Promise.all(projects.map(project => Place.findById(project.placeId)));

      // Формируем финальный объект ответа со всеми вложенными данными
      res.json({
        ...idea,
        passport,
        user,
        ideaUsers: ideaUsers.map((iu, idx) => ({
          ...iu,
          user: usersForIdeaUsers[idx], // Добавляем объект пользователя к каждому участнику
        })),
        projects: projects.map((project, idx) => ({
          ...project,
          passport: projectPassport[idx],
          place: projectPlaces[idx],
          users: usersForProjects[idx], // Добавляем объект пользователя к каждому участнику
        })),
      });
    } catch (err) {
      console.error('idea.findById error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить идею' });
    }
  },
};