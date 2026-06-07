import Project, { IParams } from '../models/project.js';
import User from '../models/user.js';
import Passport from '../models/passport.js';
import MeetUser from '../models/meetUser.js';
import Meet from '../models/meet.js';
import { Response } from 'express';
import { RequestWithPassport } from '../router.js';
import { Project as IProject } from '@shared/types'; // Импортируем пул соединений

export default {
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      if (!req.passport) {
        return res.status(401).json({ error: true, message: 'Требуется авторизация' });
      }

      const result = await Project.create({ ...req.body, passportId: req.passport.id } as unknown as IProject);
      res.status(201).json({ message: 'Проект создан', id: result });
    } catch (err) {
      console.error('project.create error:', err);
      res.status(500).json({ error: 'Ошибка при создании проекта' });
    }
  },

  update: async (req: RequestWithPassport, res: Response) => {
    try {
      await Project.update(req.params.id, req.body as unknown as IProject);
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
    try {
      const projects = await Project.findAll({ ...req.query, passportId: req.passport?.id } as unknown as IParams);

      const [usersArr, recommendMeetsArr, passportsArr] = await Promise.all([
        Promise.all(projects.map(p => User.findByProjectId(p.id))),
        Promise.all(projects.map(p => Meet.findRecommendationByProjectId(p.id))),
        Promise.all(projects.map(p => Passport.findById(p.passportId as number))),
      ]);

      const response = projects.map((project, index) => ({
        ...project,
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
      const projectId = Number(req.params.id);

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: true, message: 'Проект не найден' });
      }

      const [passport] = await Promise.all([Passport.findById(project.passportId as number)]);

      const [projectUsers, meets] = await Promise.all([User.findByProjectId(projectId), Meet.findByProjectId(projectId)]);

      const usersForMeets = await Promise.all(meets.map(meet => User.findByMeetId(meet.id)));


      res.json({
        ...project,
        passport,
        meets: meets.map((meet, idx) => ({
          ...meet,
          users: usersForMeets[idx],
        })),
        users: projectUsers,
      });
    } catch (err) {
      console.error('project.findById error:', err);
      res.status(500).send({ error: true, message: 'Не удалось получить проект' });
    }
  },


  meta: async (req: RequestWithPassport, res: Response) => {
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
        //ogImage: project.idea.image,
      });
    } catch (err) {
      console.error('project.meta error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить meta проекта' });
    }
  },
};