import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { ActiveRole } from 'entities';

/**
 * Middleware для проверки токена доступа
 */
export const usePassport = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Гость
  req.viewer = {
    role: 'guest',
    passport: null,
  };

  if (!token) {
    // Если токена нет, идем дальше (неавторизованный доступ)
    return next();
  }

  try {
    const passport = await AuthService.authenticateByToken(token);

    if (!passport) {
      return res.status(401).json({ error: true, message: 'Токен недействителен или протух' });
    }

    const userId = req.header('X-User-Id');
    const placeId = req.header('X-Place-Id');
    const role = (req.header('X-Role') || 'guest') as ActiveRole;

    req.viewer = {
      role,
      passport,
      userId: userId ? Number(userId) : undefined,
      placeId: placeId ? Number(placeId) : undefined,
    };

    req.passport = passport;

    next(); // Передаем управление следующему обработчику
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: true, message: 'Ошибка авторизации' });
  }
};