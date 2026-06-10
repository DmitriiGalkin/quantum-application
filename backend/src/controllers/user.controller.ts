import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { UserService } from '../services/user.service.js';
import type { CreateUserInput, UpdateUserInput } from '../entities/user.types.js';
import { UserDto } from '@shared/types';

const create: ControllerWithAuth<void> = async (req, res) => {
  try {
    const result = await UserService.create(req.passport!, req.body as unknown as CreateUserInput);

    ok(res, { message: 'Участник создан', ...result });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось создать участника');
  }
};

const update: ControllerWithAuth<void> = async (req, res) => {
  try {
    await UserService.update(req.passport!, (req.body as any).userId as number, req.body as unknown as UpdateUserInput);

    ok(res, { message: 'Участник успешно обновлен' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось обновить участника');
  }
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  try {
    await UserService.remove(req.passport!, Number(req.params.id));

    ok(res, { message: 'Участник и его участия в проектах удалены' });
  } catch (err: any) {
    fail(res, err.message || 'Не удалось удалить участника');
  }
};

const findById: Controller<UserDto> = async (req, res) => {
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
