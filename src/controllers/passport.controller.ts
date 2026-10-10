import { type ControllerWithAuth, ok } from './helper.js';
import { AuthService } from '../services/auth.service.js';
import type { PassportExtendedDto, UpdatePassportInput } from 'entities';

const update: ControllerWithAuth<void, UpdatePassportInput> = async (req, res) => {
  await AuthService.updateProfile(req.passport!, req.body);
  ok(res, { message: 'Профиль успешно обновлен' });
};

const login: ControllerWithAuth<{ access_token: string }> = async (req, res) => {
  const token = await AuthService.login(req.passport!);
  ok(res, { access_token: token });
};

const all: ControllerWithAuth<PassportExtendedDto> = async (req, res) => {
  const data = await AuthService.getFullProfile(req.passport!);

  ok(res, data);
};


export default {
  update,
  login,
  all,
};
