import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { ActiveRole } from 'entities';
import { requireId } from '../utils/validation.js';
import { HttpError } from '../utils/http-error.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';

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
      userId: userId ? requireId(userId, 'участника') : undefined,
      placeId: placeId ? requireId(placeId, 'центра') : undefined,
    };

    if (!['guest', 'user', 'teacher', 'place'].includes(role)) throw new HttpError('Некорректная роль', 400);
    if (role === 'place') {
      const membership = await PlacePassportRepository.findMembership(passport.id, requireId(req.viewer.placeId, 'центра'));
      if (membership?.role !== 'admin') throw new HttpError('Нет доступа к управлению центром', 403);
    }
    req.passport = passport;

    next(); // Передаем управление следующему обработчику
  } catch (err) {
    console.error('Auth middleware error:', err);
    next(err);
  }
};
