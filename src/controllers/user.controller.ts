import { type Controller, type ControllerWithAuth, fail, ok } from './helper.js';
import { UserService } from '../services/user.service.js';
import type { UserDashboardDto, UserDto, CreateUserInput, UpdateUserInput } from 'entities';

type UpdateUserBody = UpdateUserInput & { userId: number };

const create: ControllerWithAuth<number, CreateUserInput> = async (req, res) => {
  try {
    const userId = await UserService.create(req.passport!, req.body);

    ok(res, userId);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать участника');
  }
};

const update: ControllerWithAuth<void, UpdateUserBody> = async (req, res) => {
  try {
    await UserService.update(req.passport!, req.body.userId, req.body);

    ok(res, { message: 'Участник успешно обновлен' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось обновить участника');
  }
};

const remove: ControllerWithAuth<void> = async (req, res) => {
  try {
    await UserService.remove(req.passport!, Number(req.params.id));

    ok(res, { message: 'Участник и его участия в проектах удалены' });
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось удалить участника');
  }
};

const dashboard: ControllerWithAuth<UserDashboardDto> = async (req, res) => {
  try {
    const dashboard = await UserService.getDashboard(req.viewer?.userId!);

    ok(res, dashboard);
  } catch (err) {
    fail(res, 'Ошибка получения полной информации');
  }
};

const findById: Controller<UserDto> = async (req, res) => {
  try {
    const user = await UserService.findById(Number(req.params.id));

    if (!user) {
      fail(res, 'Участник не найден', 404);
    }

    ok(res, user);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось получить данные участника');
  }
};

export default {
  create,
  update,
  delete: remove,
  findById,
  dashboard,
};
