import { ok, fail } from './helper.js';
import { AuthService } from '../services/auth.service.js';
import PassportRepository from '../models/passport.repository.js';
import { toPassport } from '../mappers/passport.mapper.js';

const update = async (req, res) => {
  try {
    await AuthService.updateProfile(req.passport!, req.body);
    ok(res, { message: 'Профиль успешно обновлен' });
  } catch (err) {
    fail(res, 'Ошибка при обновлении профиля');
  }
};

const googleLogin = async (req, res) => {
  try {
    const result = await AuthService.googleLogin(req.body);
    ok(res, result);
  } catch (err) {
    fail(res, 'Ошибка при входе через Google');
  }
};

const login = async (req, res) => {
  try {
    const token = await AuthService.login(req.passport!);
    ok(res, { access_token: token });
  } catch (err) {
    fail(res, 'Неверный email или пароль', 401);
  }
};

const findById = async (req, res) => {
  try {
    if (!req.passport) {
      return fail(res, 'Пользователь не авторизован', 401);
    }

    ok(res, req.passport);
  } catch (err) {
    fail(res, 'Ошибка получения данных профиля');
  }
};

const all = async (req, res) => {
  try {
    const data = await AuthService.getFullProfile(req.passport!);
    ok(res, toPassport(data));
  } catch (err) {
    fail(res, 'Ошибка получения полной информации');
  }
};

/**
 * Middleware для проверки токена доступа
 */
const usePassport = async (req, res, next: Function) => {
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

    req.passport = passport;

    next(); // Передаем управление следующему обработчику
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: true, message: 'Ошибка авторизации' });
  }
}

export default {
  update,
  googleLogin,
  login,
  findById,
  all,
  usePassport,
};
