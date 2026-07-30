import { Controller, ControllerWithAuth, fail, ok } from './helper.js';
import { UserService } from '../services/user.service.js';
import type { CreateUserInput, UpdateUserInput } from '../entities/user.types.js';
import { TeacherDashboardDto, UserDashboardDto, UserDto } from '@shared/types';
import { TeacherService } from '../services/teacher.service.js';

const create: ControllerWithAuth<number> = async (req, res) => {
  try {
    const userId = await UserService.create(req.passport!, req.body as unknown as CreateUserInput);

    ok(res, userId);
  } catch (err) {
    fail(res, err instanceof Error ? err.message : 'Не удалось создать участника');
  }
};

const update: ControllerWithAuth<void> = async (req, res) => {
  try {
    await UserService.update(req.passport!, (req.body as any).userId as number, req.body as unknown as UpdateUserInput);

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
