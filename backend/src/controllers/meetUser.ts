import Meet from '../models/meet.js';
import MeetUser from '../models/meetUser.js';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router.js';
import { MeetUser as IMeetUser } from '@shared/types';
import User from '../models/user.js'; // Импортируем пул соединений

export default {
  /**
   * Создание участия пользователя во встрече
   */
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      const { meetId, userId } = req.body as any;

      if (!meetId || !userId) {
        return res.status(400).json({ error: true, message: 'meetId и userId обязательны' });
      }

      // Проверка существования встречи
      const meet = await Meet.findById(meetId);
      if (!meet) {
        return res.status(404).json({ error: true, message: 'Встреча не найдена' });
      }

      // Проверка на дублирование участия
      const currentMeetUser = await MeetUser.findByUserAndMeetIds(userId, meetId);
      if (currentMeetUser) {
        return res.status(409).json({ error: true, message: 'Участие уже существует' });
      }

      const allowUsers = await User.findByPassportId(req.passport.id || 0);

      // Проверка прав доступа
      if (!allowUsers.map(user => user.id).includes(userId)) {
        return res.status(403).json({ error: true, message: 'Нельзя добавлять чужого участника' });
      }

      await MeetUser.create(req.body as unknown as IMeetUser);

      res.status(201).json({ error: false, message: 'Участие создано' });
    } catch (err) {
      console.error('MeetUser.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать участие' });
    }
  },

  /**
   * Удаление участия пользователя из встречи
   */
  delete: async (req: RequestWithPassport, res: Response) => {
    try {
      const { id } = req.params; // Используем деструктуризацию для ясности
      const meetUser = await MeetUser.findById(id);

      if (!meetUser) {
        const error = new Error('Участие не существует');
        throw error;
      }

      if (!req.passport) {
        return res.status(401).json({ error: true, message: 'Нет авторизации' });
      }

      const allowUsers = await User.findByPassportId(req.passport.id || 0);


      if (!allowUsers.map((user)=>user.id).includes(meetUser.userId)) {
        return res.status(403).json({ error: true, message: 'Нет прав на удаление' });
      }

      await MeetUser.delete(id);
      res.json({ error: false, message: 'Участник удален из встречи' });
    } catch (err) {
      console.error('meetUser.delete error:', err);
      res
        .status(500)
        .json({ error: true, message: 'Не удалось удалить участие' });
    }
  },

  /**
   * Получение всех встреч для конкретного пользователя
   * Оптимизированный запрос с JOIN для сборки вложенной структуры данных.
   */
  findAll: async (req: RequestWithPassport, res: Response) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: true, message: 'Параметр userId обязателен' });
      }

      const [rows] = await MeetUser.findAll(userId);


      res.json(rows);
    } catch (err) {
      console.error('meetUser.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить посещения' });
    }
  },
};