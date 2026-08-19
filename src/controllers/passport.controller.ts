import { ControllerWithAuth, fail, ok } from './helper.js';
import { AuthService } from '../services/auth.service.js';
import PassportRepository from '../repositories/passport.repository.js';
import { ActiveRole, PassportExtendedDto } from 'types';
import { Request, Response } from 'express';
import { Passport } from '../entities/passport.js';

const update: ControllerWithAuth<void> = async (req, res) => {
  try {
    await AuthService.updateProfile(req.passport!, req.body);
    ok(res, { message: 'Профиль успешно обновлен' });
  } catch (err) {
    fail(res, 'Ошибка при обновлении профиля');
  }
};

const login: ControllerWithAuth<{ access_token: string }> = async (req, res) => {
  try {
    const token = await AuthService.login(req.passport!);
    ok(res, { access_token: token });
  } catch (err) {
    fail(res, 'Неверный email или пароль', 401);
  }
};

const all: ControllerWithAuth<PassportExtendedDto> = async (req, res) => {
  try {
    const data = await AuthService.getFullProfile(req.passport!);

    ok(res, data);
  } catch (err) {
    fail(res, 'Ошибка получения полной информации');
  }
};


/**
 * Middleware для проверки токена доступа
 */
const usePassport = async (req: Request, res: Response, next: Function) => {
  // @ts-ignore
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
    const passport = await PassportRepository.findByAccessToken(token);

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
};;



export default {
  update,
  login,
  all,
  usePassport,
};
