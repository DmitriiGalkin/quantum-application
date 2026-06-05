import User from '../models/user.js';
import ProjectUser from '../models/projectUser.js';
import { Response } from 'express';
import { RequestWithPassport } from '../router.js';
import { User as IUser } from '../../../application/src/types.js'; // Импортируем пул соединений

export default {
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      const userId = await User.create({ ...req.body, passportId: req.passport.id } as unknown as IUser);
      res.status(201).json({ message: 'Участник создан', id: userId });
    } catch (err) {
      console.error('user.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать участника' });
    }
  },

  update: async (req: RequestWithPassport, res: Response) => {
    try {
      await User.update(req.body as unknown as IUser);
      res.json({ error: false, message: 'Участник успешно обновлен' });
    } catch (err) {
      console.error('user.update error:', err);
      res.status(500).json({ error: true, message: 'Не удалось обновить участника' });
    }
  },

  delete: async (req: RequestWithPassport, res: Response) => {
    try {
      const userId = req.params.id;
      const currentPassportId = req.passport.id;

      const user = await User.findById(Number(userId));
      if (!user) {
        return res.status(404).json({ error: true, message: 'Участник не найден' });
      }

      if (user.passportId !== currentPassportId) {
        return res
          .status(403)
          .json({ error: true, message: 'Нет прав на удаление этого участника' });
      }

      await ProjectUser.deleteByUserId(userId);
      await User.delete(userId);

      res.json({ error: false, message: 'Участник и его участия в проектах удалены' });
    } catch (err) {
      console.error('user.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить участника' });
    }
  },

  findById: async (req: RequestWithPassport, res: Response) => {
    try {
      const user = await User.findById(Number(req.params.id));

      if (!user) {
        return res.status(404).json({ error: true, message: 'Участник не найден' });
      }

      res.json(user);
    } catch (err) {
      console.error('user.findById error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить данные участника' });
    }
  },
};