import Project from '../models/project.js';
import User from '../models/user.ts';
import Passport from '../models/passport.js';
import Visit from '../models/visit.js';
import Meet from '../models/meet.js';
import Place from '../models/place.js';
import ProjectUser from '../models/projectUser.js';
import redis from '../redis.js';
import {generateProjectImage, uploadImage} from "../assistants/imageAssistant.js";

export default {
  create: async (req, res) => {
    try {
      // Добавляем ID создателя из объекта авторизации
      const projectData = { ...req.body, passportId: req.passport?.id };
      const result = await Project.create(projectData);
      res.status(201).json({ message: 'Проект создан', id: result.insertId });
    } catch (err) {
      console.error('project.create error:', err);
      res.status(500).json({ error: 'Ошибка при создании проекта' });
    }
  },
  update: async (req, res) => {
    try {
      const obj = new Project(req.body);
      await Project.update(req.params.id, obj);
      res.json({ error: false, message: 'Проект обновлен' });
    } catch (err) {
      console.error('project.update error:', err);
      res.status(500).json({ error: true, message: 'Не удалось обновить проект' });
    }
  },
  delete: async (req, res) => {
    try {
      const projectId = req.params.id;
      const userId = req.passport.id;

      // Проверяем, существует ли проект
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // Проверяем права доступа (владелец ли пользователь)
      if (project.passportId !== userId) {
        return res.status(403).json({ error: true, message: 'Недостаточно прав для удаления' });
      }

      // Удаляем связанные встречи (Meets)
      const meets = await Meet.findByProjectId(projectId);
      await Promise.all(meets.map(meet => Meet.delete(meet.id)));

      // Удаляем сам проект (логическое удаление)
      await Project.delete(projectId);

      res.json({ error: false, message: 'Проект удален' });
    } catch (err) {
      console.error('project.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить проект' });
    }
  },

  findAll: async (req, res) => {
    const cacheKey = 'all_projects_list'; // Ключ для кэширования

    try {
      // 1. Пытаемся получить данные из кэша Redis
      const cachedData = await redis.get(cacheKey);

      // if (cachedData) {
      //   return res.json(JSON.parse(cachedData));
      // }

      // Передаем параметры запроса и ID текущего пользователя
      const params = { ...req.query, passportId: req.passport?.id };

      const projects = await Project.findAll(params);

      // Получаем дополнительные данные для каждого проекта параллельно
      const [places, usersArr, recommendMeetsArr, passportsArr] = await Promise.all([
        Promise.all(projects.map(p => Place.findById(p.placeId))),

        Promise.all(projects.map(p => User.findByProjectId(p.id))),

        Promise.all(projects.map(p => Meet.findRecommendationByProjectId(p.id))),

        Promise.all(projects.map(p => Passport.findById(p.passportId))),
      ]);

      // Формируем итоговый ответ, объединяя данные
      const response = projects.map((project, index) => ({
        ...project,
        place: places[index],
        users: usersArr[index],
        recommendMeet: recommendMeetsArr[index],
        passport: passportsArr[index],
      }));

      await redis.set(cacheKey, JSON.stringify(response), 'EX', 10);

      res.json(response);
    } catch (err) {
      console.error('project.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить проекты' });
    }
  },

  findById: async (req, res) => {
    try {
      const projectId = req.params.id;

      // Получаем базовую информацию о проекте
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      // Получаем все связанные данные параллельно для ускорения
      const [place, passport, user] = await Promise.all([
        Place.findById(project.placeId),
        Passport.findById(project.passportId),
        User.findById(project.userId),
      ]);

      const [projectUser, meets] = await Promise.all([
        User.findByProjectId(projectId),
        Meet.findByProjectId(projectId),
      ]);

      // Получаем данные для встреч (Visits и их Users)
      const meetsWithDetails = await Promise.all(
        meets.map(async meet => {
          const [visits, usersForVisits] = await Promise.all([
            Visit.findByMeet(meet.id),
            User.findByMeet(meet.id),
          ]);

          // Добавляем пользователя к каждому визиту
          const visitsWithUsers = visits.map((visit, idx) => ({
            ...visit,
            user: usersForVisits[idx],
          }));

          return { ...meet, visits: visitsWithUsers };
        }),
      );

      // Формируем финальный объект ответа
      res.json({
        ...project,
        passport,
        user,
        place,
        meets: meetsWithDetails,
        users: projectUser,
      });
    } catch (err) {
      console.error('project.findById error:', err);
      res.status(500).send({ error: true, message: 'Не удалось получить проект' });
    }
  },
  generateImage: async (req, res) => {
    try {
      if (!req.passport) {
        return res.status(401).json({
          error: true,
          message: 'Требуется авторизация',
        });
      }

      const projectId = req.params.id;
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      const imageBinary = await generateProjectImage(project);
      const image = await uploadImage(imageBinary);

      const obj = new Project({...project, image});
      await Project.update(req.params.id, obj);
      res.json({ error: false, message: 'Проект обновлен' });

    } catch (err) {
      console.error('chat.generateImage error:', err);
      res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Не удалось сгенерировать изображение для сообщения',
      });
    }
  },
  meta: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не существует' });
      }

      res.json({
        title: `${project.title} | Quantum`,
        description: project.description,
        ogSiteName: 'Quantum | Проекты',
        ogType: 'article',
        ogTitle: project.title,
        ogDescription: project.description,
        ogImage: project.image,
      });
    } catch (err) {
      console.error('project.meta error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить meta проекта' });
    }
  },
};
