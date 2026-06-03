import Passport from '../models/passport.js';
import User from '../models/user.js'; // Предполагаем, что это .js файл с TS-типами
import jwt from 'jsonwebtoken';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router';
import { Passport as IPassport } from '../../../application/src/types'; // Импортируем пул соединений

export default {
  /**
   * Обновление профиля пользователя (middleware usePassport должен быть вызван до этого)
   */
  update: async (req: RequestWithPassport, res: Response) => {
    try {
      if (Object.keys(req.body as unknown as IPassport).length === 0) {
        return res.status(400).json({ error: true, message: 'Пожалуйста, предоставьте данные для обновления' });
      }

      // Используем ID из уже авторизованного паспорта (из req.passport.id)
      await Passport.update(Number(req.passport.id), req.body);

      res.json({ error: false, message: 'Профиль успешно обновлен' });
    } catch (err) {
      console.error('Passport update error:', err);
      res.status(500).json({ error: true, message: 'Ошибка при обновлении профиля' });
    }
  },

  /**
   * Вход через Google OAuth
   */
  googleLogin: async (req: RequestWithPassport, res: Response) => {
    try {
      const { email, access_token, name, picture } = req.body as any;

      if (!email || !access_token) {
        return res.status(400).json({ error: true, message: 'Не хватает данных от провайдера' });
      }

      const existingPassport = await Passport.findByEmail(email);

      if (existingPassport) {
        await Passport.updateTokenById(access_token, existingPassport.id);
        return res.json({ error: false, message: 'Токен пользователя обновлен' });
      }

      const newPassportData = {
        id: 1,
        provider: 'google',
        providerId: '1',
        accessToken: access_token,
        title: name,
        image: picture,
        email: email,
      };

      await Passport.create(newPassportData);

      res.json({ error: false, message: 'Новый пользователь успешно создан' });
    } catch (err) {
      console.error('Google login error:', err);
      res.status(500).json({ error: true, message: 'Ошибка при входе через Google' });
    }
  },

  /**
   * Стандартный вход (логин)
   */
  login: async (req: RequestWithPassport, res: Response) => {
    try {
      // Генерируем JWT токен. Секретный ключ должен быть в переменной окружения.
      const token = jwt.sign({ id: req.passport.id }, process.env.JWT_SECRET || 'shhhhh', {
        expiresIn: '1h',
      });

      // Сохраняем токен в БД для пользователя
      await Passport.updateTokenById(token, Number(req.passport.id));

      res.json({ access_token: token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(401).json({ error: true, message: 'Неверный email или пароль' });
    }
  },

  /**
   * Получение информации о текущем профиле
   * Логика изменена: теперь мы просто возвращаем то, что уже есть в req.passport
   */
  findById: async (req: RequestWithPassport, res: Response) => {
    try {
      // Проверка на наличие passport в запросе (установлено middleware)
      if (!req.passport) {
        return res.status(401).json({ error: true, message: 'Пользователь не авторизован' });
      }

      // Возвращаем паспорт напрямую из объекта запроса
      res.json(req.passport);
    } catch (err) {
      console.error('Find by ID error:', err);
      res.status(500).json({ error: true, message: 'Ошибка получения данных профиля' });
    }
  },

  /**
   * Получение полной информации: профиль + связанные пользователи
   */
  all: async (req: RequestWithPassport, res: Response) => {
    try {
      if (!req.passport) {
        return res.status(401).json({ error: true, message: 'Паспорт отсутствует' });
      }

      const users = await User.findByPassportId(req.passport.id || 0);

      res.json({
        ...req.passport,
        users,
      });
    } catch (err) {
      console.error('All data error:', err);
      res.status(500).json({ error: true, message: 'Ошибка получения полной информации' });
    }
  },

  /**
   * Middleware для проверки токена доступа
   */
  usePassport: async (req: Request, res: Response, next: Function) => {
    // @ts-ignore
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Если токена нет, идем дальше (неавторизованный доступ)
      return next();
    }

    try {
      const passport = await Passport.findByAccessToken(token);

      if (!passport) {
        return res.status(401).json({ error: true, message: 'Токен недействителен или протух' });
      }

      //req.users = await User.findByPassportId(req.passport.id || 0);

      next(); // Передаем управление следующему обработчику
    } catch (err) {
      console.error('Auth middleware error:', err);
      return res.status(401).json({ error: true, message: 'Ошибка авторизации' });
    }
  },
};