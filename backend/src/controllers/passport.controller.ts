import { ControllerWithAuth, ok, fail } from './helper.js';
import { AuthService } from '../services/auth.service.js';

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
    ok(res, data);
  } catch (err) {
    fail(res, 'Ошибка получения полной информации');
  }
};

export default {
  update,
  googleLogin,
  login,
  findById,
  all,
};
