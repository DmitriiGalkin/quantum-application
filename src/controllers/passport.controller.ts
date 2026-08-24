import { type ControllerWithAuth, fail, ok } from './helper.js';
import { AuthService } from '../services/auth.service.js';
import type { PassportExtendedDto } from 'dto';

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


export default {
  update,
  login,
  all,
};
