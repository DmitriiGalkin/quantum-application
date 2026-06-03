import Project from '../models/project.js';
import User from '../models/user.js'; // Предполагаем, что это .js файл с TS-типами или уже .ts
import Passport from '../models/passport.js';
import Visit from '../models/visit.js';
import Meet from '../models/meet.js';
import Place from '../models/place.js';
import { generateProjectImage, uploadImage } from "../assistants/imageAssistant.js";
import { Response } from 'express';
import { RequestWithPassport } from '../router';


export default {
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      // Проверяем авторизацию перед доступом к req.passport.id
      if (!req.passport) {
        return res.status(401).json({ error: true, message: 'Требуется авторизация' });
      }

      const projectData = { ...req.body, passportId: req.passport.id };
      const result = await Project.create(projectData);
      res.status(201).json({ message: 'Проект создан', id: result.insertId });
    } catch (err) {
      console.error('project.create error:', err);
      res.status(500).json({ error: 'Ошибка при создании проекта' });
    }
  },

  update: async (req: RequestWithPassport, res: Response) => {
    try {
      const obj = new Project(req.body);
      await Project.update(req.params.id, obj);
      res.json({ error: false, message: 'Проект обновлен' });
    } catch (err) {
      console.error('project.update error:', err);
      res.status(500).json({ error: true, message: 'Не удалось обновить проект' });
    }
  },

  delete: async (req: RequestWithPassport, res: Response) => {
    try {
      const projectId = req.params.id;
      const userId = req.passport.id; // Безопасно, так как middleware usePassport проверяет авторизацию

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      if (project.passportId !== userId) {
        return res.status(403).json({ error: true, message: 'Недостаточно прав для удаления' });
      }

      // Удаление связанных встреч
      const meets = await Meet.findByProjectId(projectId);
      await Promise.all(meets.map(meet => Meet.delete(meet.id)));

      await Project.delete(projectId);

      res.json({ error: false, message: 'Проект удален' });
    } catch (err) {
      console.error('project.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить проект' });
    }
  },

  findAll: async (req: RequestWithPassport, res: Response) => {
    const cacheKey = 'all_projects_list';

    try {
      // const cachedData = await redis.get(cacheKey);
      // if (cachedData) {
      //   return res.json(JSON.parse(cachedData));
      // }

      const params = { ...req.query, passportId: req.passport?.id };
      const projects = await Project.findAll(params);

      const [places, usersArr, recommendMeetsArr, passportsArr] = await Promise.all([
        Promise.all(projects.map(p => Place.findById(p.placeId))),
        Promise.all(projects.map(p => User.findByProjectId(p.id))),
        Promise.all(projects.map(p => Meet.findRecommendationByProjectId(p.id))),
        Promise.all(projects.map(p => Passport.findById(p.passportId))),
      ]);

      const response = projects.map((project, index) => ({
        ...project,
        place: places[index],
        users: usersArr[index],
        recommendMeet: recommendMeetsArr[index],
        passport: passportsArr[index],
      }));

      // await redis.set(cacheKey, JSON.stringify(response), 'EX', 10);

      res.json(response);
    } catch (err) {
      console.error('project.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить проекты' });
    }
  },

  findById: async (req: RequestWithPassport, res: Response) => {
    try {
      const projectId = req.params.id;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      const [place, passport, user] = await Promise.all([
        Place.findById(project.placeId),
        Passport.findById(project.passportId),
        User.findById(project.userId),
      ]);

      const [projectUsers, meets] = await Promise.all([
        User.findByProjectId(projectId),
        Meet.findByProjectId(projectId),
      ]);

      const meetsWithDetails = await Promise.all(
        meets.map(async meet => {
          const [visits, usersForVisits] = await Promise.all([
            Visit.findByMeet(meet.id),
            User.findByMeet(meet.id),
          ]);

          const visitsWithUsers = visits.map((visit, idx) => ({
            ...visit,
            user: usersForVisits[idx],
          }));

          return { ...meet, visits: visitsWithUsers };
        }),
      );

      res.json({
        ...project,
        passport,
        user,
        place,
        meets: meetsWithDetails,
        users: projectUsers,
      });
    } catch (err) {
      console.error('project.findById error:', err);
      res.status(500).send({ error: true, message: 'Не удалось получить проект' });
    }
  },

  generateImage: async (req: RequestWithPassport, res: Response) => {
    try {
      // Middleware должен гарантировать наличие req.passport
      const projectId = req.params.id;
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      const imageBinary = await generateProjectImage(project);
      const image = await uploadImage(imageBinary);

      const updatedProject = { ...project, image };
      await Project.update(req.params.id, new Project(updatedProject));

      res.json({ error: false, message: 'Изображение проекта обновлено' });
    } catch (err) {
      console.