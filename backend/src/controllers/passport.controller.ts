import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { AuthService } from '../services/auth.service.js';
import PassportRepository from '../repositories/passport.repository.js';
import { toPassportDto } from '../mappers/passport.mapper.js';
import { PassportDto } from '@shared/types';
import { Request, Response } from 'express';

const update: ControllerWithAuth<void> = async (req, res) => {
  try {
    await AuthService.updateProfile(req.passport!, req.body);
    ok(res, { message: 'Профиль успешно обновлен' });
  } catch (err) {
    fail(res, 'Ошибка при обновлении профиля');
  }
};

const googleLogin: Controller<void> = async (req, res) => {
  try {
    const result = await AuthService.googleLogin(req.body);
    ok(res, result);
  } catch (err) {
    fail(res, 'Ошибка при входе через Google');
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

const all: ControllerWithAuth<PassportDto> = async (req, res) => {
  try {
    const data = await AuthService.getFullProfile(req.passport!);
    ok(res, toPassportDto(data));
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

  if (!token) {
    // Если токена нет, идем дальше (неавторизованный доступ)
    return next();
  }

  try {
    const passport = await PassportRepository.findByAccessToken(token);

    if (!passport) {
      return res.status(401).json({ error: true, message: 'Токен недействителен или протух' });
    }

    //req.users = await User.findByPassportId(req.passport.id || 0);
    // @ts-ignore
    req.passport = passport;

    next(); // Передаем управление следующему обработчику
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: true, message: 'Ошибка авторизации' });
  }
};

export default {
  update,
  googleLogin,
  login,
  all,
  usePassport,
};
