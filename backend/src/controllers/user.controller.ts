import { ControllerWithAuth, ok, fail } from './helper.js';
import { UserService } from '../services/user.service.js';
import type { User as IUser } from '@shared/types';

const create: ControllerWithAuth<any> = async (req, res) => {
  try {
    const result = await UserService.create(req.passport!, req.body as unknown as IUser);

    ok(res, { message: 'Участник создан', ...result });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось создать участника');
  }
};

const update: ControllerWithAuth<any> = async (req, res) => {
  try {
    await UserService.update(req.passport!, req.body as unknown as IUser);

    ok(res, { message: 'Участник успешно обновлен' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось обновить участника');
  }
};

const remove: ControllerWithAuth<any> = async (req, res) => {
  try {
    await UserService.remove(req.passport!, Number(req.params.id));

    ok(res, { message: 'Участник и его участия в проектах удалены' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось удалить участника');
  }
};

const findById = async (req, res) => {
  try {
    const user = await UserService.findById(Number(req.params.id));

    if (!user) {
      fail(res, 'Участник не найден', 404);
    }

    ok(res, user);
  } catch (err: any) {
    fail(res, err.message || 'Не удалось получить данные участника');
  }
};

export default {
  create,
  update,
  delete: remove,
  findById,
};
